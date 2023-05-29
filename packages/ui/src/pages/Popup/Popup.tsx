import { Paths } from "@cryptkeeper/constants";
import { Navigate, RouteObject, useRoutes } from "react-router-dom";

import ConfirmRequestModal from "../../components/ConfirmRequestModal";
import "../../styles.scss";
import CreateIdentity from "../CreateIdentity";
import DownloadBackup from "../DownloadBackup";
import Home from "../Home";
import Login from "../Login";
import Mnemonic from "../Mnemonic";
import Onboarding from "../Onboarding";
import Settings from "../Settings";

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
