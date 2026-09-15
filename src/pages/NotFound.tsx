import { Link } from "react-router-dom"
export function NotFound(){return <section className="mx-auto max-w-xl px-4 py-20 text-center"><h1 className="text-6xl font-bold text-navy">404</h1><p className="mt-3 text-muted-foreground">This page could not be found.</p><Link className="mt-6 inline-block text-saffron underline" to="/">Return home</Link></section>}
export default NotFound
