import React, { useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { addMenuItem } from '@/store/slices/menuSlice';

export const AddMenuItemForm = () => {
  const dispatch = useAppDispatch();

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    preparationTime: '',
    ingredients: '',
    allergens: '',
    available: true,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'available' ? value === 'true' : value,
    }));
  };

  const isValidUrl = (url: string) => /^https?:\/\/.+\..+/.test(url);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Validate fields
    if (!form.name || !form.price || !form.category || !form.image) {
      alert('Please fill all required fields');
      return;
    }

    if (isNaN(Number(form.price))) {
      alert('Price must be a number');
      return;
    }

    if (!isValidUrl(form.image)) {
      alert('Please enter a valid image URL');
      return;
    }

    dispatch(
      addMenuItem({
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        category: form.category,
        image: form.image,
        preparationTime: parseInt(form.preparationTime),
        ingredients: form.ingredients.split(',').map((i) => i.trim()),
        allergens: form.allergens.split(',').map((a) => a.trim()),
        available: form.available,
      })
    );

    alert('Menu item added successfully!');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-white rounded-xl shadow-md space-y-6 max-w-2xl mx-auto"
    >
      <h2 className="text-2xl font-semibold text-gray-800">Add New Menu Item</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            name="name"
            placeholder="Item name"
            value={form.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <input
            name="category"
            placeholder="e.g. Pizza, Drinks"
            value={form.category}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Price</label>
          <input
            name="price"
            type="number"
            placeholder="e.g. 299"
            value={form.price}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Image URL</label>
          <input
            name="image"
            placeholder="https://example.com/image.jpg"
            value={form.image}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Preparation Time (min)</label>
          <input
            name="preparationTime"
            type="number"
            placeholder="e.g. 15"
            value={form.preparationTime}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Available</label>
          <select
            name="available"
            value={form.available ? 'true' : 'false'}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          placeholder="Short description"
          value={form.description}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Ingredients (comma-separated)
        </label>
        <input
          name="ingredients"
          placeholder="e.g. Tomato, Cheese, Basil"
          value={form.ingredients}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Allergens (comma-separated)
        </label>
        <input
          name="allergens"
          placeholder="e.g. Gluten, Nuts"
          value={form.allergens}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      <div className="pt-4">
        <button
          type="submit"
          className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md font-medium transition"
        >
          Add Menu Item
        </button>
      </div>
    </form>
  );
};
