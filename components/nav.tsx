"use client"
import { Button } from "@heroui/button";
import { signIn, signOut, useSession } from "next-auth/react";
import { Skeleton } from "@heroui/react";
import { useState } from "react";

const Nav = () => {
	const { data: session, status } = useSession();
	const [clicked, setClicked] = useState<boolean>(false);
	if (status === "loading") {
		return (
			<nav className="w-full flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 shadow-sm">
				<div className="flex items-center space-x-3">
					{/* Logo skeleton */}
					<Skeleton className="w-8 h-8 rounded-full" />
					<Skeleton className="w-24 h-6 rounded hidden sm:block" />
				</div>

				<div className="flex items-center space-x-3">
					<Skeleton className="w-32 h-6 rounded hidden md:block" />
					<Skeleton className="w-20 h-9 rounded-lg" />
				</div>
			</nav>
		);
	}

	return (
		<nav className="w-full flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 shadow-sm">
			<div className="flex items-center space-x-2 sm:space-x-3">
				{/* Logo*/}
				<span className="text-lg sm:text-xl font-semibold text-gray-800 hidden sm:block">Accessibility Analyzer</span>
			</div>
			<div className="flex items-center space-x-2 sm:space-x-4">
				{!session ? (
					<Button
						onPress={() => { setClicked(true); signIn("google"); }}
						isDisabled={clicked}
						className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-6 py-2 rounded-lg font-medium transition-colors duration-200 shadow-sm text-sm sm:text-base"
					>
						<span className="hidden sm:inline">Sign In With Google</span>
						<span className="sm:hidden">Sign In</span>
					</Button>
				) : (
					<div className="flex items-center space-x-2 sm:space-x-4">
						<div className="flex items-center space-x-2 sm:space-x-3">
							{session.user?.image && (
								<img
									src={session.user.image}
									alt="Profile"
									className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-gray-200 flex-shrink-0"
								/>
							)}
							<span className="text-gray-700 font-medium text-sm sm:text-base hidden md:block">
								Hello, {session.user?.name?.split(' ')[0] || 'User'}
							</span>
						</div>
						<Button
							onPress={() => signOut({ callbackUrl: '/' })}
							variant="bordered"
							className="border-gray-300 text-gray-700 hover:bg-gray-50 px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-sm sm:text-base"
						>
							<span className="hidden sm:inline">Sign Out</span>
							<span className="sm:hidden">Out</span>
						</Button>
					</div>
				)}
			</div>
		</nav>
	);
}

export default Nav;