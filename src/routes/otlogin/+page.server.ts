import { AuthApiError } from "@supabase/supabase-js"
import { fail, redirect } from "@sveltejs/kit"
import type { Actions } from "./$types"

export const actions: Actions = {
	register: async (event) => {

		const {locals, request } = event

		const body = Object.fromEntries(await request.formData())

		console.log("locals",locals)

	},
}
