import { Router, Request, Response } from 'express';
import { faker } from '@faker-js/faker';

const router = Router();

interface Item {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

type OrderMap = Record<string, string[]>;

const TOTAL_ITEMS = 1_000_000;
const allItems: Item[] = Array.from({ length: TOTAL_ITEMS }, (_: unknown, i: number) => ({
  id: String(i + 1),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  avatar: faker.image.avatar(),
}));

const orderMap: OrderMap = {};
const selectedSet: Set<string> = new Set();

router.get('/', (req: Request, res: Response, next) => {
  try {
    const offset = parseInt(req.query.offset as string, 10) || 0;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const search = (req.query.search as string | undefined)?.toLowerCase() || '';

    let items = search
      ? allItems.filter(
          item =>
            item.name.toLowerCase().includes(search) ||
            item.email.toLowerCase().includes(search)
        )
      : allItems;

    const order = orderMap[search] || [];
    if (order.length > 0) {
      const orderedSet = new Set(order);
      const idToItem = Object.fromEntries(items.map(it => [it.id, it])) as Record<string, Item>;
      const orderedItems = order.map(id => idToItem[id]).filter(Boolean);
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
    const search = (req.query.search as string | undefined)?.toLowerCase() || '';
    res.json(orderMap[search] || []);
  } catch (error) {
    next(error);
  }
});


router.post('/order', (req: Request, res: Response, next) => {
  try {
    const search = (req.query.search as string | undefined)?.toLowerCase() || '';
    const ids = Array.isArray(req.body) ? req.body : [];
    orderMap[search] = ids.filter((id): id is string => typeof id === 'string');
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
