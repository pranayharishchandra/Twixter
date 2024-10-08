import { Navigate, Route, Routes } from "react-router-dom";

import HomePage         from "./pages/home/HomePage";
import LoginPage        from "./pages/auth/login/LoginPage";
import SignUpPage       from "./pages/auth/signup/SignUpPage";
import NotificationPage from "./pages/notification/NotificationPage";
import ProfilePage      from "./pages/profile/ProfilePage";

import Sidebar    from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanel"; 

import { Toaster }    from "react-hot-toast";
import { useQuery }   from "@tanstack/react-query";
import LoadingSpinner from "./components/common/LoadingSpinner";

//*** Correct, in React Query, there is no centralized store like in Redux Toolkit (RTK). However, React Query provides a cache that behaves somewhat similarly for managing and sharing server state across components. 

function App() {
	//* change according to authUser - loggedIn or not - since we will show then "protected routes" accourdingly
	// *** useQuery hook with the queryKey: ["authUser"] is used in the App component, which acts as the parent component.
	const { data: authUser, isLoading } = useQuery({
		// we use queryKey to give a unique name to our query and refer to it later
		queryKey: ["authUser"],
		queryFn : async () => {
			try {
				const res  = await fetch("/api/auth/me"); // by default, the fetch function in JavaScript makes a GET request and expects a response in application/json 
				const data = await res.json();

				if (data.error) return null;

				//* if status code in 200 to 299 range - res.ok is true
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}

				console.log("authUser is here:", data);
				return data;
			} 
			catch (error) {
				throw new Error(error);
			}
		},
		retry: false, // default 3, don't retry
	});

	if (isLoading) {
		return (
			<div className='h-screen flex justify-center items-center'>
				<LoadingSpinner size='lg' />
			</div>
		);
	}

	return (
		<div className='flex max-w-6xl mx-auto'>
			
			{authUser && <Sidebar />} {/* Common component, bc it's not wrapped with Routes */}

			<Routes>
				<Route path = '/'                  element = { authUser ? <HomePage />         : <Navigate to='/login' />} />
				<Route path = '/login'             element = {!authUser ? <LoginPage />        : <Navigate to='/'      />} />
				<Route path = '/signup'            element = {!authUser ? <SignUpPage />       : <Navigate to='/'      />} />
				<Route path = '/profile/:username' element = { authUser ? <ProfilePage />      : <Navigate to='/login' />} />
				<Route path = '/notifications'     element = { authUser ? <NotificationPage /> : <Navigate to='/login' />} />
			</Routes>

			{authUser && <RightPanel />}

			<Toaster />

		</div>
	);
}

export default App;
