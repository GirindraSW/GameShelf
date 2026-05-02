'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { Gamepad2, Eye, EyeOff, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { registerSchema, type RegisterInput } from '@/lib/validations/auth'

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  async function onSubmit(data: RegisterInput) {
    setServerError(null)
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name,
        },
      },
    })

    if (error) {
      if (error.message.includes('already registered')) {
        setServerError('Email ini sudah terdaftar. Silakan login.')
      } else {
        setServerError('Gagal mendaftar. Silakan coba lagi.')
      }
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <div
        className="rounded-2xl p-8 border text-center"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: 'rgba(0, 229, 160, 0.1)' }}
        >
          <span className="text-3xl">✅</span>
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Cek Email Kamu!
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          Kami mengirim link verifikasi ke email kamu. Klik link tersebut untuk mengaktifkan akun.
        </p>
        <Link
          href="/login"
          className="inline-block py-3 px-6 rounded-xl font-semibold text-sm transition-all"
          style={{ backgroundColor: 'var(--brand-primary)', color: '#fff' }}
        >
          Ke Halaman Login
        </Link>
      </div>
    )
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
          Buat Akun Baru
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Sudah punya akun?{' '}
          <Link
            href="/login"
            className="font-medium transition-colors"
            style={{ color: 'var(--brand-primary)' }}
          >
            Masuk di sini
          </Link>
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

        {/* Nama Lengkap */}
        <div className="space-y-1.5">
          <label
            htmlFor="full_name"
            className="text-sm font-medium"
            style={{ color: 'var(--text-secondary)' }}
          >
            Nama Lengkap
          </label>
          <input
            id="full_name"
            type="text"
            placeholder="Nama kamu"
            autoComplete="name"
            className="w-full px-4 py-3 rounded-xl text-sm transition-all outline-none"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              border: `1px solid ${errors.full_name ? 'var(--status-danger)' : 'var(--border-default)'}`,
              color: 'var(--text-primary)',
            }}
            {...register('full_name')}
          />
          {errors.full_name && (
            <p className="text-xs" style={{ color: 'var(--status-danger)' }}>
              {errors.full_name.message}
            </p>
          )}
        </div>

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
              placeholder="Min. 8 karakter"
              autoComplete="new-password"
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
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs" style={{ color: 'var(--status-danger)' }}>
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="confirm_password"
            className="text-sm font-medium"
            style={{ color: 'var(--text-secondary)' }}
          >
            Konfirmasi Password
          </label>
          <div className="relative">
            <input
              id="confirm_password"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Ulangi password"
              autoComplete="new-password"
              className="w-full px-4 py-3 pr-12 rounded-xl text-sm transition-all outline-none"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                border: `1px solid ${errors.confirm_password ? 'var(--status-danger)' : 'var(--border-default)'}`,
                color: 'var(--text-primary)',
              }}
              {...register('confirm_password')}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
              style={{ color: 'var(--text-muted)' }}
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirm_password && (
            <p className="text-xs" style={{ color: 'var(--status-danger)' }}>
              {errors.confirm_password.message}
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
              Mendaftarkan...
            </>
          ) : (
            'Buat Akun'
          )}
        </button>

        <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
          Dengan mendaftar, kamu setuju dengan syarat & ketentuan GameShelf.
        </p>
      </form>
    </div>
  )
}
