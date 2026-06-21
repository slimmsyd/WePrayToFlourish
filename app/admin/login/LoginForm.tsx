"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "../actions";

const initial: LoginState = {};

export default function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initial);

  return (
    <form action={action} className="flex flex-col gap-[16px]">
      <label className="flex flex-col gap-[7px] text-[13px] tracking-[0.02em] text-ink-soft">
        Password
        <input
          type="password"
          name="password"
          required
          autoFocus
          placeholder="••••••••"
          className="w-full rounded-[8px] border border-[rgba(26,23,20,0.22)] bg-paper px-[15px] py-[13px] font-body text-[16px] text-ink outline-none transition-colors focus:border-gold"
        />
      </label>

      {state.error && (
        <p className="m-0 rounded-[8px] border border-[#b3261e]/30 bg-[#b3261e]/[0.06] px-[14px] py-[10px] text-[13px] text-[#8a1d17]">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-[2px] cursor-pointer rounded-full border-none bg-dark px-[24px] py-[14px] font-display text-[15px] font-medium tracking-[0.02em] text-paper transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
