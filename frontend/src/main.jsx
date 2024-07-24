import React    from "react";
import ReactDOM from "react-dom/client";
import App      from "./App.jsx";
import "./index.css";
import { BrowserRouter }                    from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
		},
	},
});

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<BrowserRouter>
			<QueryClientProvider client={queryClient}>
				<App />
			</QueryClientProvider>
		</BrowserRouter>
	</React.StrictMode>
);

/* HOW TO USE REACT QUERY
* Mutation State: 
"isCommenting" and "isLiking" should be used to check if the mutation is in progress to prevent multiple submissions.

* Initial State: 
The mutation state variables (isCommenting and isLiking) are initially false and become true when the mutation starts, and back to false once it ends.


* *** HOW TO USE IT ***
* Initial Check: 
The if (isCommenting) return; ensures the function exits if a comment is already being posted.
* Mutation Execution: 
commentPost() or likePost() ``triggers`` the mutation, setting isCommenting or isLiking to true immediately.

 */

/**  VERY IMPORTANT CONCEPT
** ========================================================================
// First Component
const { data: authUser, isLoading } = useQuery({
    queryKey: ["authUser"],
**  queryFn: async () => {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Something went wrong");
        return data;
    },
});

// Second Component
const { data: authUser } = useQuery({
    queryKey: ["authUser"],
**  // No queryFn here, will use the cached data fetched by the first component
});

** ========================================================================

** ========================:Conclusion:========================
** Both components with the same queryKey will share the same data.
** The queryFn in the first component will fetch the data and cache it.
** The second component will use the cached data without needing its own queryFn.
*/

/*  QUESTION 1 refetchOnWindowFocus
* 1. refetchOnWindowFocus Default Value:
Yes, the default value of refetchOnWindowFocus in React Query (or TanStack Query) is true. This means that by default, queries will refetch their data when the window regains focus.

* 2. Behavior When Changing Tabs or Desktop:
Yes, if refetchOnWindowFocus is set to true (which is the default), then the query will refetch when you switch tabs or desktops and then return to the original tab. This can lead to the data being re-fetched and the components using that data being re-rendered.
 */

/* Will it create ambiguity?
* 2) Question:
You are using useQuery with queryKey: ["authUser"] in two different components. 
Is this the same function? 
What if you write some other function with the same query key? 
Will it create ambiguity?

* Answer:

Key Points:

Same Query Key Across Components:

Yes, the same query key ["authUser"] will refer to the same cached data.
React Query manages a global cache and associates data with the provided query key.
Using Different Query Functions:

If you define a different function for the same query key, the result might be inconsistent.
Ideally, use the same function or ensure both functions return consistent data.
Best Practices:

Define a central function (like in a separate api.js file) and import it wherever needed.
Ensure the query function for queryKey: ["authUser"] is the same across components to avoid ambiguity and inconsistency.
 */