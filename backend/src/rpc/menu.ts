import { z } from 'zod';
import { MenuItemModel } from '../models/MenuItem';

const getItemSchema = z.object({
  itemId: z.string().uuid()
});

const addItemSchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.number().positive(),
  category: z.string(),
  image: z.string().url().optional(),
  available: z.boolean().optional().default(true),
});

export const menuHandlers = {
  // ✅ For frontend fetchMenu() — returns both items and grouped categories
  'menu.list': async () => {
    const items = await MenuItemModel.findAll();

    const categoryMap: Record<string, typeof items> = {};
    for (const item of items) {
      if (!categoryMap[item.category]) {
        categoryMap[item.category] = [];
      }
      categoryMap[item.category].push(item);
    }

    const categories = Object.entries(categoryMap).map(([categoryName, items]) => ({
      id: categoryName,
      name: categoryName,
      items
    }));

    return {
      items,
      categories
    };
  },

  // Old fallback (can be removed if not used anymore)
  'menu.getMenu': async () => {
    return await MenuItemModel.findAll();
  },

  'menu.getItem': async (params: any) => {
    const { itemId } = getItemSchema.parse(params);
    const item = await MenuItemModel.findById(itemId);
    if (!item) {
      throw new Error('Menu item not found');
    }
    return item;
  },

  'menu.addItem': async (params: any) => {
    const itemData = addItemSchema.parse(params);
    const newItem = await MenuItemModel.create(itemData);
    return newItem;
  }
};
