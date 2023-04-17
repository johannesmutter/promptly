import { AuthApiError } from "@supabase/supabase-js"
import { fail, redirect } from "@sveltejs/kit"
import type { Actions } from "./$types"

export const actions: Actions = {
	register: async (event) => {

		const {locals, request } = event

		const body = Object.fromEntries(await request.formData())

		const { data, error: err } = await locals.supabase.auth.signInWithOtp({
			email: body.email as string,
			options: {
				emailRedirectTo: 'https://www.heypromptly.com/',
			  },
		})

		if (err) {
			if (err instanceof AuthApiError && err.status === 400) {
				return fail(400, {
					error: "Invalid email or password",
				})
			}
			return fail(500, {
				error: "Server error. Please try again later.",
			})
		}

		throw redirect(303, "/")
	},
}
