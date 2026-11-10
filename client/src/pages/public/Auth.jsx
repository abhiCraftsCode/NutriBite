import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Field, FormError, Spinner } from '../../components/ui';
import { homeFor } from '../../utils/format';

function AuthFrame({ title, sub, children, foot }) {
  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">
      <div className="relative hidden overflow-hidden rounded-tile bg-ink p-10 text-white lg:block">
        <h2 className="font-serif text-4xl font-semibold leading-tight">Eat well,<br />know exactly what is in it.</h2>
        <p className="mt-4 max-w-xs text-sm text-white/70">Every NutriBite meal lists its calories, protein, carbs, fat and ingredients before you order.</p>
        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-brand" />
        <div className="absolute -bottom-10 -right-10 h-56 w-56 rounded-full bg-white/90" />
      </div>
      <div className="tile p-8 sm:p-10">
        <h1 className="font-serif text-3xl font-semibold">{title}</h1>
        <p className="mt-1 text-sm text-mute">{sub}</p>
        <div className="mt-6">{children}</div>
        <p className="mt-6 text-sm text-mute">{foot}</p>
      </div>
    </div>
  );
}

export function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const from = useLocation().state?.from;
  const [f, setF] = useState({ email: '', password: '' });
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr(null);
    try { const u = await login(f); nav(from && u.role === 'CUSTOMER' ? from : homeFor(u.role), { replace: true }); }
    catch (x) { setErr(x); } finally { setBusy(false); }
  };
  return (
    <AuthFrame title="Welcome back" sub="Sign in to order meals, track deliveries or manage the kitchen."
      foot={<>New here? <Link className="font-medium text-brand" to="/register">Create a customer account</Link></>}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email"><input className="input" type="email" required autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
        <Field label="Password"><input className="input" type="password" required autoComplete="current-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></Field>
        <FormError error={err} />
        <button className="btn-ink w-full" disabled={busy}>{busy && <Spinner className="!text-white" />}Sign in</button>
      </form>
    </AuthFrame>
  );
}

export function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '' });
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr(null);
    const body = { ...f }; if (!body.phone) delete body.phone;
    try { const u = await register(body); nav(homeFor(u.role), { replace: true }); }
    catch (x) { setErr(x); } finally { setBusy(false); }
  };
  return (
    <AuthFrame title="Create your account" sub="Customer accounts are active immediately."
      foot={<>Already registered? <Link className="font-medium text-brand" to="/login">Sign in</Link></>}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Full name"><input className="input" required value={f.name} onChange={set('name')} autoComplete="name" /></Field>
        <Field label="Email"><input className="input" type="email" required value={f.email} onChange={set('email')} autoComplete="email" /></Field>
        <Field label="Phone" hint="Used as the contact number for deliveries."><input className="input" inputMode="tel" minLength={7} maxLength={20} value={f.phone} onChange={set('phone')} autoComplete="tel" /></Field>
        <Field label="Password"><input className="input" type="password" required minLength={8} value={f.password} onChange={set('password')} autoComplete="new-password" /></Field>
        <FormError error={err} />
        <button className="btn-ink w-full" disabled={busy}>{busy && <Spinner className="!text-white" />}Create account</button>
      </form>
    </AuthFrame>
  );
}
