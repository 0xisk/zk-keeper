import { ButtonType, Button } from "../../components/Button";
import { Icon } from "../../components/Icon";
import { PasswordInput } from "../../components/PasswordInput";
import logoSVG from "../static/icons/logo.svg";

import "./login.scss";
import { useLogin } from "./useLogin";

const Login = (): JSX.Element => {
  const { isLoading, errors, register, onSubmit, isShowPassword, onShowPassword } = useLogin();

  return (
    <form className="flex flex-col flex-nowrap h-full login" data-testid="login-form" onSubmit={onSubmit}>
      <div className="flex flex-col items-center flex-grow p-8 login__content">
        <Icon className="login-icon" url={logoSVG} />

        <div className="text-lg pt-8">
          <b>Welcome Back!</b>
        </div>

        <div className="text-base">To continue, please unlock your wallet</div>

        <div className="py-4 w-full password-input">
          <PasswordInput
            autoFocus
            isShowEye
            errorMessage={errors.password}
            id="password"
            isShowPassword={isShowPassword}
            label="Password"
            onShowPassword={onShowPassword}
            {...register("password")}
          />
        </div>
      </div>

      <div className="flex flex-row items-center justify-center flex-shrink p-8 login__footer">
        <Button buttonType={ButtonType.PRIMARY} data-testid="unlock-button" loading={isLoading} type="submit">
          Unlock
        </Button>
      </div>
    </form>
  );
};

export default Login;
