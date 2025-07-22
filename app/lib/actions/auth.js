"use server"
import { signIn } from "../../auth"
import {z} from "zod"
export const githubLogIn = async () => {
   await signIn("github", { redirectTo: "/" })
}

export const googleLogIn =async () => {
    await signIn("google", { redirectTo: "/" })
}

const loginSchema=z.object({
    email:z.string().email({message:"Invalid email"}),
    password:z.string().min(6,{message:"password must be atleast of 6 characters"})
})

export const loginAction=async(initialState,formData)=>{
    const email=formData.get("email")
    const password=formData.get("password")
    const formValues={
        email,password
    }
    const result=loginSchema.safeParse(formValues)
    if(!result.success){
        const errors=result.error.flatten().fieldErrors;
        return {errors:errors}
    }
    console.log(email+' '+password)
    return {success:true}
}

