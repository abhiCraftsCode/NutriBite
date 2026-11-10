import { Mail, MapPin, Phone } from 'lucide-react';

export function About() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-serif text-4xl font-semibold sm:text-5xl">One kitchen, no fine print.</h1>
      <p className="mt-6 text-lg leading-relaxed text-neutral-700">NutriBite is a single restaurant that cooks healthy meals and tells you exactly what is in them. We publish serving size, calories, protein, carbohydrates, fat, preparation time, ingredients and allergen notes for every dish.</p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="tile p-7"><h2 className="text-xl font-semibold">Stocked to order</h2><p className="mt-2 text-sm text-neutral-700">We track ingredient stock in the kitchen. When something runs out, the meals that need it are marked unavailable instead of being sold and cancelled.</p></div>
        <div className="tile bg-ink p-7 text-white"><h2 className="text-xl font-semibold">Our own riders</h2><p className="mt-2 text-sm text-white/70">Deliveries are handled by NutriBite partners, so every status update comes straight from the people carrying your meal.</p></div>
        <div className="tile p-7 sm:col-span-2"><h2 className="text-xl font-semibold">Your ideas on the menu</h2><p className="mt-2 text-sm text-neutral-700">Signed-in customers can suggest a meal with ingredients and a recipe. Our team reviews each suggestion and replies with a note.</p></div>
      </div>
    </div>
  );
}

export function Contact() {
  const rows = [[Mail, 'Email', 'Reach us through your account profile email after signing in'], [Phone, 'Orders', 'Open Orders to see the delivery status and contact details for any order'], [MapPin, 'Kitchen', 'We cook and dispatch from a single kitchen']];
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-serif text-4xl font-semibold sm:text-5xl">Get in touch</h1>
      <p className="mt-4 text-neutral-700">The fastest way to sort out an order is from your order page, where the status timeline shows what the kitchen and rider have done so far.</p>
      <div className="mt-8 space-y-3">
        {rows.map(([Icon, t, s]) => (
          <div key={t} className="tile flex items-center gap-4 p-5"><span className="grid h-11 w-11 place-items-center rounded-full bg-brand-light text-brand"><Icon size={18} /></span><div><div className="font-medium">{t}</div><div className="text-sm text-mute">{s}</div></div></div>
        ))}
      </div>
    </div>
  );
}
