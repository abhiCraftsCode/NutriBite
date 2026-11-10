import { useState } from 'react';
import { Salad } from 'lucide-react';
import { categoryApi, foodApi, ingredientApi, recipeApi } from '../../services';
import useFetch from '../../utils/useFetch';
import CrudPage from '../../components/CrudPage';
import { Async, Field, FormError, Modal, Plate, useToast } from '../../components/ui';
import { inr, toPaise, toRupees } from '../../utils/format';

const num = (v) => (v === '' || v == null ? undefined : Number(v));
const tag = (on, yes, no) => <span className={`pill ${on ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-600'}`}>{on ? yes : no}</span>;

export const CategoriesPage = () => (
  <CrudPage cfg={{
    key: 'cat', title: 'Categories', noun: 'Category', sub: 'Untick Active to hide a category. Delete only works while it has no foods.', removeLabel: 'Delete', nameOf: (r) => r.name,
    load: () => categoryApi.list(), create: categoryApi.create, update: categoryApi.update, remove: categoryApi.remove,
    columns: [{ label: 'Name', render: (r) => <span className="font-medium">{r.name}</span> }, { label: 'Description', key: 'description' }, { label: 'Status', render: (r) => tag(r.isActive !== false, 'Active', 'Inactive') }],
    fields: [
      { name: 'name', label: 'Name', required: true }, { name: 'image', label: 'Image URL', type: 'url' },
      { name: 'description', label: 'Description', type: 'textarea', wide: true }, { name: 'isActive', label: 'Active', type: 'checkbox', default: true },
    ],
    toBody: (v) => ({ name: v.name, ...(v.description && { description: v.description }), ...(v.image && { image: v.image }), isActive: !!v.isActive }),
  }} />
);

export const IngredientsPage = () => (
  <CrudPage cfg={{
    key: 'ing', title: 'Ingredients', noun: 'Ingredient', sub: 'Stock is changed from Inventory. Deactivating hides an ingredient everywhere.', searchable: true, nameOf: (r) => r.name,
    load: () => ingredientApi.list(), create: ingredientApi.create, update: ingredientApi.update, remove: ingredientApi.remove,
    columns: [{ label: 'Name', render: (r) => <span className="font-medium">{r.name}</span> }, { label: 'Unit', key: 'unit' }, { label: 'In stock', render: (r) => `${r.stockQuantity ?? 0} ${r.unit}` }, { label: 'Reorder level', key: 'reorderLevel' }],
    fields: [
      { name: 'name', label: 'Name', required: true }, { name: 'unit', label: 'Unit', required: true, hint: 'For example g, ml, pcs' },
    ],
    toBody: (v) => ({ name: v.name, unit: v.unit }),
  }} />
);

function FoodIngredients({ food, onClose, onSaved }) {
  const toast = useToast();
  const all = useFetch(() => ingredientApi.list(), []);
  const detail = useFetch(() => foodApi.get(food.id), [food.id]);
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);
  const list = rows ?? (detail.data ? (detail.data.ingredients || []).map((i) => ({ ingredientId: i.ingredientId, quantity: i.quantity })) : null);
  const setRow = (k, patch) => setRows(list.map((r, i) => (i === k ? { ...r, ...patch } : r)));
  const save = async (e) => {
    e.preventDefault(); setBusy(true); setErr(null);
    try {
      await foodApi.setIngredients(food.id, list.map((r) => ({ ingredientId: Number(r.ingredientId), quantity: Number(r.quantity) })));
      toast('Ingredients saved'); onSaved(); onClose();
    } catch (x) { setErr(x); } finally { setBusy(false); }
  };
  return (
    <Modal wide title={`Ingredients · ${food.name}`} onClose={onClose}>
      <p className="mb-4 text-xs text-mute">Quantity is what one serving uses. Saving replaces the whole list. At least one ingredient is required before a meal can be ordered.</p>
      <Async state={{ ...detail, data: list }}>
        {(items) => (
          <form onSubmit={save} className="space-y-3">
            {items.length === 0 && <p className="text-sm text-mute">No ingredients yet.</p>}
            {items.map((r, k) => (
              <div key={k} className="grid grid-cols-[1fr_120px_auto] items-end gap-2">
                <Field label={k === 0 ? 'Ingredient' : ''}><select className="input" required value={r.ingredientId} onChange={(e) => setRow(k, { ingredientId: e.target.value })}><option value="">Select…</option>{(all.data || []).map((i) => <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}</select></Field>
                <Field label={k === 0 ? 'Per serving' : ''}><input className="input" type="number" step="any" min="0.0001" required value={r.quantity} onChange={(e) => setRow(k, { quantity: e.target.value })} /></Field>
                <button type="button" className="btn-danger !px-3" aria-label="Remove ingredient" onClick={() => setRows(items.filter((_, i) => i !== k))}>Remove</button>
              </div>
            ))}
            <button type="button" className="btn-ghost" onClick={() => setRows([...items, { ingredientId: '', quantity: '' }])}>Add ingredient</button>
            <FormError error={err} />
            <div className="flex justify-end"><button className="btn-ink" disabled={busy || items.length === 0}>Save ingredients</button></div>
          </form>
        )}
      </Async>
    </Modal>
  );
}

export function FoodsPage() {
  const cats = useFetch(() => categoryApi.list(), []);
  const [ing, setIng] = useState(null);
  const [stamp, setStamp] = useState(0);
  const catOpts = (cats.data || []).filter((c) => c.isActive !== false).map((c) => ({ value: c.id, label: c.name }));
  const cfg = {
    key: `food-${catOpts.length}-${stamp}`, title: 'Foods', noun: 'Food', sub: 'Menu items, nutrition per serving, and what is live.', searchable: true, removeLabel: 'Archive', nameOf: (r) => r.name,
    load: async () => (await foodApi.list()).items, create: foodApi.create, update: foodApi.update, remove: foodApi.remove,
    columns: [
      { label: 'Meal', render: (r) => <div className="flex items-center gap-3"><Plate src={r.image} className="h-10 w-10" alt="" /><span className="font-medium">{r.name}</span></div> },
      { label: 'Price', render: (r) => inr(r.price) }, { label: 'kcal', key: 'calories' },
      { label: 'Ingredients', render: (r) => (r.ingredients?.length ? r.ingredients.length : <span className="text-brand">None</span>) },
      { label: 'Published', render: (r) => tag(r.isPublished, 'Live', 'Hidden') }, { label: 'Stock', render: (r) => tag(r.isAvailable, 'Available', 'Unavailable') },
    ],
    rowActions: (r) => <button aria-label="Assign ingredients" title="Ingredients" className="grid h-9 w-9 place-items-center rounded-xl ring-1 ring-line hover:bg-soft" onClick={() => setIng(r)}><Salad size={15} /></button>,
    fields: [
      { name: 'name', label: 'Name', required: true }, { name: 'categoryId', label: 'Category', type: 'select', options: catOpts, required: true },
      { name: 'description', label: 'Description', type: 'textarea', wide: true }, { name: 'image', label: 'Image URL', type: 'url', wide: true },
      { name: 'price', label: 'Price (₹)', type: 'number', step: '0.01', min: 0.01, required: true, hint: 'Saved to the server in paise.' }, { name: 'servingSize', label: 'Serving size' },
      { name: 'calories', label: 'Calories (kcal)', type: 'number', min: 0, step: 'any' }, { name: 'protein', label: 'Protein (g)', type: 'number', step: 'any', min: 0 },
      { name: 'carbohydrates', label: 'Carbohydrates (g)', type: 'number', step: 'any', min: 0 }, { name: 'fat', label: 'Fat (g)', type: 'number', step: 'any', min: 0 },
      { name: 'prepTimeMinutes', label: 'Prep time (min)', type: 'number', min: 1, step: 1 }, { name: 'notes', label: 'Notes and allergens', type: 'textarea', wide: true },
      { name: 'isPublished', label: 'Published on the menu', type: 'checkbox', default: true }, { name: 'isAvailable', label: 'Available to order', type: 'checkbox', default: true },
    ],
    toForm: (r) => ({ ...r, price: toRupees(r.price), categoryId: r.categoryId ?? '' }),
    toBody: (v) => {
      const b = { name: v.name, categoryId: Number(v.categoryId), price: toPaise(v.price), isPublished: !!v.isPublished, isAvailable: !!v.isAvailable };
      ['description', 'image', 'servingSize', 'notes'].forEach((k) => v[k] && (b[k] = v[k]));
      ['calories', 'protein', 'carbohydrates', 'fat', 'prepTimeMinutes'].forEach((k) => num(v[k]) !== undefined && (b[k] = num(v[k])));
      return b;
    },
  };
  return <><CrudPage cfg={cfg} />{ing && <FoodIngredients food={ing} onClose={() => setIng(null)} onSaved={() => setStamp((n) => n + 1)} />}</>;
}

/** Recipes live on the food (GET /foods returns them); PUT /recipes/:foodId upserts. */
export function RecipesPage() {
  const foods = useFetch(async () => (await foodApi.list()).items, []);
  const opts = (foods.data || []).map((f) => ({ value: f.id, label: f.name }));
  return (
    <CrudPage cfg={{
      key: `rec-${opts.length}`, title: 'Recipes', noun: 'Recipe', sub: 'Preparation steps for each meal. Create one by choosing a meal.', nameOf: (r) => r.name,
      load: async () => (await foodApi.list()).items.filter((f) => f.recipe).map((f) => ({ ...f.recipe, id: f.id, foodId: f.id, name: f.name })),
      create: (b) => recipeApi.save(b.foodId, b.body), update: (id, b) => recipeApi.save(id, b.body),
      columns: [{ label: 'Meal', render: (r) => <span className="font-medium">{r.name}</span> }, { label: 'Prep (min)', key: 'prepTimeMinutes' }, { label: 'Cook (min)', key: 'cookTimeMinutes' }],
      fields: [
        { name: 'foodId', label: 'Meal', type: 'select', options: opts, required: true, lockOnEdit: true }, { name: 'prepTimeMinutes', label: 'Prep time (min)', type: 'number', min: 0, step: 1 },
        { name: 'cookTimeMinutes', label: 'Cook time (min)', type: 'number', min: 0, step: 1 }, { name: 'instructions', label: 'Instructions (min 10 characters)', type: 'textarea', rows: 7, wide: true, required: true },
      ],
      toBody: (v) => ({ foodId: Number(v.foodId), body: { instructions: v.instructions, ...(num(v.prepTimeMinutes) !== undefined && { prepTimeMinutes: num(v.prepTimeMinutes) }), ...(num(v.cookTimeMinutes) !== undefined && { cookTimeMinutes: num(v.cookTimeMinutes) }) } }),
    }} />
  );
}
