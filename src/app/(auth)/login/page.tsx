'use client'

import { Suspense, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Gamepad2, Eye, EyeOff, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { loginSchema, type LoginInput } from '@/lib/validations/auth'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? '/'

  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginInput) {
    setServerError(null)
    const supabase = createClient()

    const { data: signInData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      setServerError('Email atau password salah. Silakan coba lagi.')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', signInData.user?.id ?? '')
      .single()

    if (profile?.role === 'admin') {
      router.push('/admin/products')
    } else {
      router.push(redirectTo)
    }
    router.refresh()
  }

  return (
    <div
      className="rounded-2xl p-8 border"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Gamepad2
            className="w-8 h-8"
            style={{ color: 'var(--brand-primary)' }}
          />
          <span
            className="text-2xl font-bold"
            style={{
              background: 'linear-gradient(135deg, #6C63FF, #00D9FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            GameShelf
          </span>
        </div>
        <h1
          className="text-2xl font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
          Masuk ke Akun
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Belum punya akun?{' '}
          <Link href="/register" className="font-medium transition-colors" style={{ color: 'var(--brand-primary)' }}>
            Daftar sekarang
          </Link>
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Server Error */}
        {serverError && (
          <div
            className="rounded-xl px-4 py-3 text-sm"
            style={{
              backgroundColor: 'rgba(255, 77, 109, 0.1)',
              border: '1px solid rgba(255, 77, 109, 0.3)',
              color: 'var(--status-danger)',
            }}
          >
            {serverError}
          </div>
        )}

        {/* Email */}
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="text-sm font-medium"
            style={{ color: 'var(--text-secondary)' }}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="kamu@email.com"
            autoComplete="email"
            className="w-full px-4 py-3 rounded-xl text-sm transition-all outline-none"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              border: `1px solid ${errors.email ? 'var(--status-danger)' : 'var(--border-default)'}`,
              color: 'var(--text-primary)',
            }}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-xs" style={{ color: 'var(--status-danger)' }}>
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="text-sm font-medium"
            style={{ color: 'var(--text-secondary)' }}
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full px-4 py-3 pr-12 rounded-xl text-sm transition-all outline-none"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                border: `1px solid ${errors.password ? 'var(--status-danger)' : 'var(--border-default)'}`,
                color: 'var(--text-primary)',
              }}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
              style={{ color: 'var(--text-muted)' }}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs" style={{ color: 'var(--status-danger)' }}>
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60"
          style={{
            backgroundColor: 'var(--brand-primary)',
            color: '#fff',
          }}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Memproses...
            </>
          ) : (
            'Masuk'
          )}
        </button>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          className="rounded-2xl p-8 border flex items-center justify-center"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
            minHeight: 420,
          }}
        >
          <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--brand-primary)' }} />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
