import { Navigate, RouteObject, useRoutes } from "react-router-dom";
import { Paths } from "@cryptkeeper/constants";

import ConfirmRequestModal from "@src/components/ConfirmRequestModal";
import CreateIdentity from "@src/pages/CreateIdentity";
import DownloadBackup from "@src/pages/DownloadBackup";
import Home from "@src/pages/Home";
import Login from "@src/pages/Login";
import Mnemonic from "@src/pages/Mnemonic";
import Onboarding from "@src/pages/Onboarding";
import Settings from "@src/pages/Settings";

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
