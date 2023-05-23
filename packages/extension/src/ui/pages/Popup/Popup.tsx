import { Navigate, RouteObject, useRoutes } from "react-router-dom";

import { Paths } from "packages/extension/src/constants";
import ConfirmRequestModal from "packages/extension/src/ui/components/ConfirmRequestModal";
import CreateIdentity from "packages/extension/src/ui/pages/CreateIdentity";
import DownloadBackup from "packages/extension/src/ui/pages/DownloadBackup";
import Home from "packages/extension/src/ui/pages/Home";
import Login from "packages/extension/src/ui/pages/Login";
import Mnemonic from "packages/extension/src/ui/pages/Mnemonic";
import Onboarding from "packages/extension/src/ui/pages/Onboarding";
import Settings from "packages/extension/src/ui/pages/Settings";

import "../../styles.scss";

import { usePopup } from "./usePopup";

const routeConfig: RouteObject[] = [
  { path: Paths.HOME, element: <Home /> },
  { path: Paths.CREATE_IDENTITY, element: <CreateIdentity /> },
  { path: Paths.LOGIN, element: <Login /> },
  { path: Paths.ONBOARDING, element: <Onboarding /> },
  { path: Paths.REQUESTS, element: <ConfirmRequestModal /> },
  { path: Paths.SETTINGS, element: <Settings /> },
  { path: Paths.DOWNLOAD_BACKUP, element: <DownloadBackup /> },
  { path: Paths.MNEMONIC, element: <Mnemonic /> },
  {
    path: "*",
    element: <Navigate to={Paths.HOME} />,
  },
];

const Popup = (): JSX.Element | null => {
  const routes = useRoutes(routeConfig);
  const { isLoading } = usePopup();

  if (isLoading) {
    return null;
  }

  return <div className="popup">{routes}</div>;
};

export default Popup;
