import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { AuthShell } from "../components/AuthShell"
import { Button, Input, Label } from "../components/ui"
import { loginAdmin } from "../lib/services"
import { useAuth } from "../store/auth"
export function AdminLogin(){const navigate=useNavigate();const setSession=useAuth((s)=>s.setSession);const [employeeId,setEmployeeId]=useState("");const [password,setPassword]=useState("");return <AuthShell title="Admin login" subtitle="For authorized officers only" admin><form className="space-y-4" onSubmit={async(e)=>{e.preventDefault();const result=await loginAdmin(employeeId,password);setSession(result.token,"admin",{id:result.admin.id,name:result.admin.name,email:`${employeeId}@cpgrams.gov.in`});navigate("/admin")}}><div><Label required htmlFor="employeeId">Employee ID</Label><Input id="employeeId" value={employeeId} onChange={(e)=>setEmployeeId(e.target.value)} required /></div><div><Label required htmlFor="password">Password</Label><Input id="password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required /></div><Button type="submit" className="w-full">Sign in as admin</Button></form></AuthShell>}
export default AdminLogin
