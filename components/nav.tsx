"use client"
import { Button } from "@heroui/button";
import { signIn, signOut, useSession } from "next-auth/react"

const Nav = () => {
	const {data:session, status} = useSession();

	if(status === "loading") {
		return <div>loading....</div>
	}

	return (
		<nav>
			{!session ? (
				<Button onPress={()=>signIn("google")}>
						Sign In With Google
				</Button>
			):(
				<div>
				<span>Hello {session?.user?.name}</span>
				<button onClick={() => signOut()}>Sign Out</button>
				</div>
			)}
		</nav>
	);
}

export default Nav