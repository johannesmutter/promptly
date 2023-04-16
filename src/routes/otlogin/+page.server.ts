import { AuthApiError } from "@supabase/supabase-js"
import { fail, redirect } from "@sveltejs/kit"
import type { Actions } from "./$types"

export const actions: Actions = {
	register: async ({ request, locals }) => {

		const body = Object.fromEntries(await request.formData())

		console.log("locals",locals)

		const { data, error: err } = await locals.supabase.auth.signInWithOtp({
			email: body.email as string,
			options: {
				emailRedirectTo: 'http://127.0.0.1:5173/',
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
