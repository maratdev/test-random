import {Request, Response, Router} from 'express';
import {faker} from '@faker-js/faker';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();

interface Item {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

const ORDER_FILE_PATH = path.join(__dirname, 'order.json');

function saveOrder(order: string[]): void {
  try {
    fs.writeFileSync(ORDER_FILE_PATH, JSON.stringify(order, null, 2));
  } catch (error) {
    console.error('Ошибка сохранения порядка:', error);
  }
}

function loadOrder(): string[] {
  try {
    if (fs.existsSync(ORDER_FILE_PATH)) {
      const data = fs.readFileSync(ORDER_FILE_PATH, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Ошибка загрузки порядка:', error);
  }
  return [];
}

// Глобальный порядок для всех элементов
let globalOrder: string[] = [];

const TOTAL_ITEMS = 1_000_000;
const allItems: Item[] = Array.from({ length: TOTAL_ITEMS }, (_: unknown, i: number) => ({
  id: String(i + 1),
  name: `${String(i + 1)}. ${faker.person.fullName()}`,
  email: faker.internet.email(),
  avatar: faker.image.avatar(),
}));

const savedOrder = loadOrder();
globalOrder = savedOrder.length > 0 ? savedOrder : allItems.map(item => item.id);

const selectedSet: Set<string> = new Set();

router.get('/', (req: Request, res: Response, next) => {
  try {
    const offset = parseInt(req.query.offset as string, 10) || 0;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const search = (req.query.search as string | undefined)?.toLowerCase() || '';

    let items = search
      ? allItems.filter(
          item => {
            return (
                item.id === search ||
              item.name.toLowerCase().includes(search) ||
              item.email.toLowerCase().includes(search)
            );
          }
        )
      : allItems;

    if (globalOrder.length > 0) {
      const orderedSet = new Set(globalOrder);
      const idToItem = Object.fromEntries(items.map(it => [it.id, it])) as Record<string, Item>;
      const orderedItems = globalOrder.map((id: string) => idToItem[id]).filter(Boolean);
      const restItems = items.filter(item => !orderedSet.has(item.id));

      items = [...orderedItems, ...restItems];
    }

    res.json({
      total: items.length,
      items: items.slice(offset, offset + limit),
    });
  } catch (error) {
    next(error);
  }
});


router.get('/order', (req: Request, res: Response, next) => {
  try {
    res.json(globalOrder);
  } catch (error) {
    next(error);
  }
});


router.post('/order', (req: Request, res: Response, next) => {
  try {
    const ids = Array.isArray(req.body) ? req.body : [];
    const search = (req.query.search as string | undefined)?.toLowerCase() || '';

    if (search) {
      const newGlobalOrder = [...globalOrder];

      const firstSearchItemIndex = newGlobalOrder.findIndex(id => ids.includes(id));
      
      if (firstSearchItemIndex !== -1) {
        ids.forEach(id => {
          const index = newGlobalOrder.indexOf(id);
          if (index !== -1) {
            newGlobalOrder.splice(index, 1);
          }
        });

        ids.forEach((id, index) => {
          newGlobalOrder.splice(firstSearchItemIndex + index, 0, id);
        });
      }
      
      globalOrder = newGlobalOrder;
    } else {
      globalOrder = ids.filter((id): id is string => typeof id === 'string');
    }
    
    saveOrder(globalOrder);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});


router.get('/selection', (req: Request, res: Response, next) => {
  try {
    res.json(Array.from(selectedSet));
  } catch (error) {
    next(error);
  }
});

router.post('/selection', (req: Request, res: Response, next) => {
  try {
    const ids = Array.isArray(req.body) ? req.body : [];
    selectedSet.clear();
    ids.forEach((id: string) => selectedSet.add(id));
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
