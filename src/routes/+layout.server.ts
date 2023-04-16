import { getServerSession } from "@supabase/auth-helpers-sveltekit";
import type { LayoutServerLoad } from "./$types"
//import "../app.css";


export const load: LayoutServerLoad = async (event) => {
	console.log("Ran layout load")
	return {
		session: await getServerSession(event),
	}
}
