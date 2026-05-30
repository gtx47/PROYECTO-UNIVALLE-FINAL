'use client';

import { motion, type Variants } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { apiFetch } from '@/app/lib/api';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const } },
};

const PW_COLORS = ['bg-[#E8E6E2]', 'bg-red-400', 'bg-amber-400', 'bg-lime-400', 'bg-green-500'];
const PW_LABELS = ['', 'Débil', 'Aceptable', 'Buena', 'Fuerte'];

// Solo letras (incluyendo tildes, ñ, ü) y espacios — sin números ni símbolos
const NAME_RE = /^[A-Za-záéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldErrors = { name?: string; email?: string; password?: string };

function validateFields(name: string, email: string, password: string): FieldErrors {
  const errs: FieldErrors = {};

  const trimmedName = name.trim();
  if (!trimmedName) {
    errs.name = 'El nombre es obligatorio.';
  } else if (trimmedName.length < 2) {
    errs.name = 'El nombre debe tener al menos 2 caracteres.';
  } else if (!NAME_RE.test(trimmedName)) {
    errs.name = 'El nombre solo puede contener letras y espacios (sin números ni símbolos).';
  }

  if (!email) {
    errs.email = 'El correo es obligatorio.';
  } else if (!EMAIL_RE.test(email)) {
    errs.email = 'Ingresa un correo electrónico válido.';
  }

  if (!password) {
    errs.password = 'La contraseña es obligatoria.';
  } else if (password.length < 8) {
    errs.password = 'La contraseña debe tener al menos 8 caracteres.';
  }

  return errs;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="font-body mt-1 px-1 text-[11px] text-[#C92A2A]" role="alert">
      {message}
    </p>
  );
}

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const pwScore = (() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/\d/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const handleBlur = (field: keyof FieldErrors) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setFieldErrors(validateFields(name, email, password));
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (touched.name) setFieldErrors(validateFields(val, email, password));
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (touched.email) setFieldErrors(validateFields(name, val, password));
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (touched.password) setFieldErrors(validateFields(name, email, val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateFields(name, email, password);
    setFieldErrors(errs);
    setTouched({ name: true, email: true, password: true });
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setError('');
    setSuccess(false);

    const r = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: name.trim(), email, password }),
    });

    if (!r.ok) {
      setError(r.error || 'Error al registrar');
      setLoading(false);
      return;
    }

    setSuccess(true);
    setName('');
    setEmail('');
    setPassword('');
    setFieldErrors({});
    setTouched({});
    setLoading(false);
  };

  const borderClass = (field: keyof FieldErrors) =>
    touched[field] && fieldErrors[field] ? 'border-[#C92A2A]' : 'border-[#E8E6E2]';

  return (
    <main className="relative grid min-h-screen w-full grid-cols-1 overflow-hidden bg-[#FAFAF8] md:grid-cols-[35%_65%]">
      <Link
        href="/"
        className="font-body absolute right-6 top-6 z-30 inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#6B6B6B] transition-colors duration-200 hover:text-[#1A1A1A] md:right-10 md:top-8"
      >
        <ArrowLeft size={14} strokeWidth={1.75} />
        Volver al inicio
      </Link>

      <div className="hidden bg-[#F0EFED] md:block" aria-hidden />

      <div className="flex items-center justify-center px-6 py-14 md:px-12 lg:px-20">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="w-full max-w-[420px]"
        >
          <motion.h1
            variants={item}
            className="font-display font-bold text-[#1A1A1A]"
            style={{ fontSize: 'clamp(28px, 3.4vw, 38px)', letterSpacing: '-0.03em', lineHeight: 1.1 }}
          >
            Crea tu cuenta
          </motion.h1>

          <motion.p variants={item} className="font-body mt-2 text-[14px] leading-[1.5] text-[#6B6B6B]">
            Regístrate para empezar a comprar en segundos.
          </motion.p>

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 flex items-start gap-2.5 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-[13px] text-green-800"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mt-0.5 flex-shrink-0">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
                <path d="m8 12 3 3 5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Usuario creado exitosamente. Ya puedes{' '}
              <Link href="/login" className="font-semibold underline">iniciar sesión</Link>.
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 flex items-start gap-2.5 rounded-md border border-[#C92A2A]/25 bg-[#C92A2A]/5 px-4 py-3 text-[13px] text-[#C92A2A]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mt-0.5 flex-shrink-0">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
                <path d="M12 8v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="12" cy="16" r="1" fill="currentColor" />
              </svg>
              {error}
            </motion.div>
          )}

          <motion.form variants={item} className="mt-7 space-y-3" onSubmit={handleSubmit} noValidate>
            {/* Nombre */}
            <div>
              <div className={`rounded-md border bg-white px-4 py-2 transition-colors duration-200 focus-within:border-[#C92A2A] ${borderClass('name')}`}>
                <label htmlFor="name" className="font-body block text-[11px] text-[#6B6B6B]">
                  Nombre completo
                </label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  onBlur={() => handleBlur('name')}
                  placeholder="Tu nombre"
                  aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                  className="font-body w-full bg-transparent text-[14px] text-[#1A1A1A] outline-none placeholder:text-[#6B6B6B]/50"
                />
              </div>
              {touched.name && <FieldError message={fieldErrors.name} />}
            </div>

            {/* Email */}
            <div>
              <div className={`rounded-md border bg-white px-4 py-2 transition-colors duration-200 focus-within:border-[#C92A2A] ${borderClass('email')}`}>
                <label htmlFor="email" className="font-body block text-[11px] text-[#6B6B6B]">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onBlur={() => handleBlur('email')}
                  placeholder="tucorreo@univalle.edu.co"
                  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                  className="font-body w-full bg-transparent text-[14px] text-[#1A1A1A] outline-none placeholder:text-[#6B6B6B]/50"
                />
              </div>
              {touched.email && <FieldError message={fieldErrors.email} />}
            </div>

            {/* Password */}
            <div>
              <div className={`relative rounded-md border bg-white px-4 py-2 transition-colors duration-200 focus-within:border-[#C92A2A] ${borderClass('password')}`}>
                <label htmlFor="password" className="font-body block text-[11px] text-[#6B6B6B]">
                  Contraseña
                </label>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  onBlur={() => handleBlur('password')}
                  placeholder="Mínimo 8 caracteres"
                  aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                  className="font-body w-full bg-transparent pr-8 text-[14px] text-[#1A1A1A] outline-none placeholder:text-[#6B6B6B]/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B6B] transition-colors duration-200 hover:text-[#C92A2A]"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>

              {touched.password && <FieldError message={fieldErrors.password} />}

              {/* Medidor de seguridad */}
              {password.length > 0 && (
                <div className="mt-2 px-1">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= pwScore ? PW_COLORS[pwScore] : 'bg-[#E8E6E2]'}`}
                      />
                    ))}
                  </div>
                  <p className="font-body text-[11px] text-[#6B6B6B]">
                    Seguridad: <span className="text-[#1A1A1A]">{PW_LABELS[pwScore] || '—'}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={loading ? {} : { scale: 1.01 }}
              whileTap={loading ? {} : { scale: 0.99 }}
              transition={{ duration: 0.2 }}
              className="font-body mt-3 w-full rounded-md bg-[#C92A2A] py-[13px] text-[13px] font-semibold uppercase tracking-[0.08em] text-white transition-colors duration-300 hover:bg-[#a82020] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Creando…
                </span>
              ) : (
                'Crear cuenta'
              )}
            </motion.button>
          </motion.form>

          <motion.div variants={item} className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-[#E8E6E2]" />
            <span className="font-body text-[11px] uppercase tracking-[0.2em] text-[#6B6B6B]">OR</span>
            <span className="h-px flex-1 bg-[#E8E6E2]" />
          </motion.div>

          <motion.button
            variants={item}
            type="button"
            className="font-body flex w-full items-center justify-center gap-3 rounded-md border border-[#E8E6E2] bg-white py-[12px] text-[13px] font-medium text-[#1A1A1A] transition-colors duration-200 hover:bg-[#F0EFED]"
          >
            <GoogleIcon />
            Continue with Google
          </motion.button>

          <motion.p variants={item} className="font-body mt-6 text-center text-[13px] text-[#6B6B6B]">
            ¿Ya tienes cuenta?{' '}
            <Link
              href="/login"
              className="text-xs uppercase tracking-widest text-[#C92A2A] transition-colors duration-200 hover:underline"
            >
              Inicia sesión
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </main>
  );
}
