// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	const locals = event.locals
	const session = locals.getSession()
  return {
    session
  };
};