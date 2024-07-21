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

/* //* refetchOnWindowFocus
* 1. refetchOnWindowFocus Default Value:
Yes, the default value of refetchOnWindowFocus in React Query (or TanStack Query) is true. This means that by default, queries will refetch their data when the window regains focus.

* 2. Behavior When Changing Tabs or Desktop:
Yes, if refetchOnWindowFocus is set to true (which is the default), then the query will refetch when you switch tabs or desktops and then return to the original tab. This can lead to the data being re-fetched and the components using that data being re-rendered.

 */