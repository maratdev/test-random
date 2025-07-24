import React, {useEffect, useRef, useState} from 'react';
import {Avatar, Checkbox, Divider, Input, List, Skeleton, Typography} from 'antd';
import InfiniteScroll from 'react-infinite-scroll-component';
import {DragDropContext, Draggable, Droppable, type DropResult} from "@hello-pangea/dnd";
import {MoreOutlined} from '@ant-design/icons';
import './App.css';
import {api} from './api';
import {debounce} from 'lodash';

interface DataType {
	name: string;
	email: string;
	avatar: string;
	id: string;
}

const {Text} = Typography;
const PAGE_SIZE = 20;

const App: React.FC = () => {
	const [loading, setLoading] = useState(false);
	const [data, setData] = useState<DataType[]>([]);
	const [selected, setSelected] = useState<string[]>([]);
	const [search, setSearch] = useState(() => localStorage.getItem('search') || '');
	const [hasMore, setHasMore] = useState(true);
	const pageRef = useRef(0);

	const debouncedSearch = useRef(
		debounce((val: string) => {
			localStorage.setItem('search', val);
			setSearch(val);
		}, 300)
	).current;

	const handleOnDragEnd = (result: DropResult) => {
		const {destination, source} = result;
		if (!destination) return;

		setData(prev => {
			const cloned = [...prev];
			const [movedItem] = cloned.splice(source.index, 1);
			cloned.splice(destination.index, 0, movedItem);
			api.setOrder(cloned.map(item => item.id || ''), search);
			return cloned;
		});
	};

	const handleSelect = (id: string, checked: boolean) => {
		setSelected(prev => {
			const newSelected = checked ? [...prev, id] : prev.filter(sid => sid !== id);
			api.setSelection(newSelected);
			return newSelected;
		});
	};

	const loadMoreData = async () => {
		if (loading) return;
		setLoading(true);

		const offset = pageRef.current * PAGE_SIZE;
		const [{items, total}, order] = await Promise.all([
			api.getItems({offset, limit: PAGE_SIZE, search}),
			api.getOrder(search),
		]);

		setData(prev => {
			const uniqueNewItems = items.filter((item: DataType) => !prev.some((p: DataType) => p.id === item.id));
			const combined = [...prev, ...uniqueNewItems];

			if (!order?.length) return combined;

			const itemMap = new Map(combined.map(it => [it.id, it]));
			const orderedItems = order.map((id: string) => itemMap.get(id)).filter(Boolean);
			const unordered = combined.filter(it => !order.includes(it.id));
			return [...orderedItems, ...unordered];
		});

		pageRef.current += 1;
		setHasMore((pageRef.current * PAGE_SIZE) < total);
		setLoading(false);
	};

	useEffect(() => {
		setData([]);
		pageRef.current = 0;
		setHasMore(true);
		// Восстанавливаем выбранные элементы
		api.getSelection().then((sel: string[]) => setSelected(sel));
		setTimeout(() => {
			loadMoreData();
		}, 0);
		// eslint-disable-next-line
	}, [search]);

	return (
		<div
			id="scrollableDiv"
			className="app-scrollable"
		>
			<div className="app-sticky-header">
				<Input.Search
					defaultValue={search}
					placeholder="Поиск по названию или email"
					allowClear
					onChange={e => debouncedSearch(e.target.value)}
					className="app-search"
					size="large"
				/>
				<Text strong>Элементов: {data.length}</Text>
			</div>
			<DragDropContext onDragEnd={handleOnDragEnd}>
				<Droppable droppableId="DropId">
					{(provided) => (
						<div ref={provided.innerRef} {...provided.droppableProps}>
							<InfiniteScroll
								dataLength={data.length}
								next={loadMoreData}
								hasMore={hasMore}
								loader={<Skeleton avatar paragraph={{rows: 1}} active/>}
								endMessage={<Divider plain>It is all, nothing more 🤐</Divider>}
								scrollableTarget="scrollableDiv"
							>
								<List
									bordered
									rowKey="id"
									dataSource={data}
									size="small"
									renderItem={(item, index) => (
										<Draggable draggableId={`draggable-${item.id}`} index={index} key={item.id}>
											{(provided, snapshot) => (
												<div
													ref={provided.innerRef}
													{...provided.draggableProps}
													{...provided.dragHandleProps}
													className={snapshot.isDragging ? 'dragging' : ''}
												>
													<List.Item key={item.id}>
														<List.Item.Meta
															avatar={<Avatar src={item.avatar}/>}
															title={<a href="https://ant.design">{item.name}</a>}
															description={item.email}
														/>
														<Checkbox
															checked={selected.includes(item.id || '')}
															onChange={(e) => handleSelect(item.id || '', e.target.checked)}
															className="app-checkbox"
														/>
														<span className="drag-handle"><MoreOutlined/></span>
													</List.Item>
												</div>
											)}
										</Draggable>
									)}
								/>
								{provided.placeholder}
							</InfiniteScroll>
						</div>
					)}
				</Droppable>
			</DragDropContext>
		</div>
	);
};

export default App;
