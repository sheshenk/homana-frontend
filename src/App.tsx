import { useContext } from "react";
import { Route, Routes } from "react-router-dom";
import AppContainer from "./components/navigation/AppContainer";
import ApplicationsPage from "./pages/ApplicationsPage";
import AuthPage from "./pages/AuthPage";
import ClaimsPage from "./pages/ClaimsPage";
import DashboardPage from "./pages/DashboardPage";
import PoliciesPage from "./pages/PoliciesPage";
import QuotationsPage from "./pages/QuotationsPage";
import SettingsPage from "./pages/SettingsPage";
import { UserContext } from "./services/userContextProvider";

export default function App() {
	const { user } = useContext(UserContext)
	if (user === undefined) return <></>
	if (user === null) return <AuthPage/>
	return (
		<AppContainer>
			<Routes>
				<Route path="/" element={<DashboardPage/>}/>
				<Route path="/claims" element={<ClaimsPage/>}/>
				<Route path="/policies" element={<PoliciesPage/>}/>
				<Route path="/quotations" element={<QuotationsPage/>}/>
				<Route path="/settings" element={<SettingsPage/>}/>
				<Route path="/applications" element={<ApplicationsPage/>}/>
			</Routes>
		</AppContainer>
	)
}