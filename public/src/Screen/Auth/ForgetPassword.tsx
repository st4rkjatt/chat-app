import  { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { Input, Ripple, initTE } from "tw-elements";
import { AppDispatch } from "../../reduxToolkit/Store";
import {
  ForgetPasswordAction,
  ResetPasswordAction,
  VerifyOTPAction,
} from "../../reduxToolkit/Reducers/Auth.tsx/ForgetPasswordSlice";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate } from "react-router-dom";
const ForgetPassword = () => {
  useEffect(() => {
    initTE({ Input, Ripple }, { allowReinits: true });
  });
  const [email, setEmail] = useState("");
  const dispatch: AppDispatch = useDispatch();
  const [isForgot, setIsForgot] = useState(true);
  const [isVerify, setIsVerify] = useState(false);
  const [isEnterPass, setIsEnterPass] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = (e:any) => {
    e.preventDefault();
    dispatch(ForgetPasswordAction(email)).then((res) => {
      console.log("rund", res);
      if (res.payload.status === true) {
        setIsVerify(true);
        setIsForgot(false);
      }
    });
  };

  const handleOtpChange = (index: number, value: string) => {
    if (/^[0-9]$/.test(value) || value === "") {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move focus to the next input
      if (
        value !== "" &&
        index < otp.length - 1 &&
        inputRefs.current[index + 1]
      ) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleBackspace = (index: number) => {
    const newOtp = [...otp];

    // If the current input is empty, move focus to the previous input
    if (index > 0 && newOtp[index] === "") {
      inputRefs.current[index - 1]?.focus();
    }

    newOtp[index] = "";
    setOtp(newOtp);
  };

  const handleVerifyOtp = () => {
    const enteredOtp = otp.join("");
    // Add your OTP verification logic here
    console.log("Verifying OTP:", enteredOtp);
    const data = {
      email,
      otp: enteredOtp,
    };
    dispatch(VerifyOTPAction(data)).then((res) => {
      if (res.payload.status === true) {
        setIsEnterPass(true);
        setIsVerify(false);
      }
    });
  };

  const handleKeyPress = (
    e: any,
    index: number
  ) => {
    if (e.key === "Backspace") {
      handleBackspace(index);
    }
  };

  const handleChange = (e: any) => {
    const { value, name } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmitPass = (e:any) => {
    e.preventDefault();
    // console.log({ ...form, email }, "form");
    dispatch(ResetPasswordAction({ ...form, email })).then((res) => {
      if (res.payload.status === true) {
        setTimeout(() => {
          setIsEnterPass(false);
          navigate("/");
        }, 2000);
      }
    });
  };

  return (
    <>
      <ToastContainer />
      <section className="h-screen">
        <div className="h-full">
          {/* Left column container with background*/}
          <div className="g-6 flex h-full flex-wrap items-center justify-center lg:justify-center ">
            <div className="shrink-1 mb-12 grow-0 basis-auto md:mb-0 md:w-9/12 md:shrink-0 lg:w-6/12 xl:w-6/12">
              <img
                src="https://tecdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp"
                className="w-full"
                alt="Sample image"
              />
            </div>

            <div className="flex flex-col items-center justify-center px-6 pt-8 mx-auto md:h-screen pt:mt-0 dark:bg-gray-900">
              {isForgot && (
                <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 border">
                  <div className="w-full p-6 sm:p-8">
                    <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
                      Forgot your password?
                    </h2>
                    <p className="text-base font-normal text-gray-500 dark:text-gray-400">
                      Don't fret! Just type in your email and we will send you a
                      code to reset your password!
                    </p>
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                      <div className="relative mb-6" data-te-input-wrapper-init>
                        <input
                          type="email"
                          className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[2.15] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200 dark:placeholder:text-neutral-200 [&:not([data-te-input-placeholder-active])]:placeholder:opacity-0"
                          id="exampleFormControlInput2"
                          placeholder="Email address"
                          value={email}
                          required
                          onChange={(e) => setEmail(e.target.value)}
                        />
                        <label
                          htmlFor="exampleFormControlInput2"
                          className="pointer-events-none absolute left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[2.15] text-neutral-500 transition-all duration-200 ease-out peer-focus:-translate-y-[1.15rem] peer-focus:scale-[0.8] peer-focus:text-primary peer-data-[te-input-state-active]:-translate-y-[1.15rem] peer-data-[te-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-neutral-200 dark:peer-focus:text-primary"
                        >
                          Email address
                        </label>
                      </div>

                      <button
                        type="submit"
                        className="inline-block rounded bg-primary px-7 pb-2.5 pt-3 text-sm font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                        data-te-ripple-init
                        data-te-ripple-color="light"
                      >
                        Forgot Password
                      </button>
                      <p className="mb-0 mt-2 pt-1 text-sm font-semibold">
                        an account?{" "}
                        <Link to="/">
                          <a
                            href="#!"
                            className="text-danger transition duration-150 ease-in-out hover:text-danger-600 focus:text-danger-600 active:text-danger-700"
                          >
                            Login
                          </a>
                        </Link>
                      </p>
                    </form>
                  </div>
                </div>
              )}

              {isVerify && (
                <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 border">
                  <div className="w-full p-6">
                    <div className="bg-white h-72 py-3 rounded text-center">
                      <h1 className="text-2xl font-bold">OTP Verification</h1>
                      <div className="flex flex-col mt-2">
                        <span>Enter the OTP you received at</span>
                        <span className="font-bold">{email}</span>
                      </div>
                      <div
                        id="otp"
                        className="flex flex-row justify-center text-center px-2 mt-5"
                      >
                        {otp.map((digit, index) => (
                          <input
                            key={index}
                            className="m-2 border h-10 w-10 text-center form-control rounded"
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) =>
                              handleOtpChange(index, e.target.value)
                            }
                            onKeyDown={(e) => handleKeyPress(e, index)}
                            ref={(ref) => (inputRefs.current[index] = ref)}
                          />
                        ))}
                      </div>
                      <div className="flex  mt-5">
                        <a className="flex  text-blue-700 hover:text-blue-900 cursor-pointer">
                          <button
                            type="button"
                            className="inline-block rounded bg-primary px-7 pb-2.5 pt-3 text-sm font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                            onClick={handleVerifyOtp}
                            data-te-ripple-init
                            data-te-ripple-color="light"
                          >
                            Verify OTP
                          </button>
                          <i className="bx bx-caret-right ml-1" />
                        </a>
                      </div>
                      <p className="py-4 text-sm font-semibold text-start">
                        Resend otp?{" "}
                        <Link to="/forget-password">
                          <a
                            href="#!"
                            className="text-danger transition duration-150 ease-in-out hover:text-danger-600 focus:text-danger-600 active:text-danger-700"
                          >
                            Resend OTP
                          </a>
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {isEnterPass && (
                <div className="w-[40rem] bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 border">
                  <div className="w-full p-6">
                    <h1 className="text-2xl font-bold">Reset password</h1>
                    <div className="flex flex-col my-4">
                      <span>Reset your password carefully.</span>
                    </div>
                    <form onSubmit={handleSubmitPass}>
                      <div className="relative mb-6" data-te-input-wrapper-init>
                        <input
                          type="text"
                          className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[2.15] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200 dark:placeholder:text-neutral-200 [&:not([data-te-input-placeholder-active])]:placeholder:opacity-0"
                          id="email"
                          placeholder="Email address"
                          name="password"
                          value={form.password}
                          onChange={handleChange}
                          required
                        />
                        <label
                          htmlFor="exampleFormControlInput2"
                          className="pointer-events-none absolute left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[2.15] text-neutral-500 transition-all duration-200 ease-out peer-focus:-translate-y-[1.15rem] peer-focus:scale-[0.8] peer-focus:text-primary peer-data-[te-input-state-active]:-translate-y-[1.15rem] peer-data-[te-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-neutral-200 dark:peer-focus:text-primary"
                        >
                          Enter new password
                        </label>
                      </div>
                      <div className="relative mb-6" data-te-input-wrapper-init>
                        <input
                          type="text"
                          className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[2.15] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200 dark:placeholder:text-neutral-200 [&:not([data-te-input-placeholder-active])]:placeholder:opacity-0"
                          id="text"
                          placeholder="Confirm password"
                          name="confirmPassword"
                          value={form.confirmPassword}
                          onChange={handleChange}
                          required
                        />
                        <label
                          htmlFor="exampleFormControlInput2"
                          className="pointer-events-none absolute left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[2.15] text-neutral-500 transition-all duration-200 ease-out peer-focus:-translate-y-[1.15rem] peer-focus:scale-[0.8] peer-focus:text-primary peer-data-[te-input-state-active]:-translate-y-[1.15rem] peer-data-[te-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-neutral-200 dark:peer-focus:text-primary"
                        >
                          Confirm password
                        </label>
                      </div>
                      <div className="flex justify-center text-center mt-5">
                        <a className="flex items-center text-blue-700 hover:text-blue-900 cursor-pointer">
                          <button
                            type="submit"
                            className="inline-block rounded bg-primary px-7 pb-2.5 pt-3 text-sm font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                            data-te-ripple-init
                            data-te-ripple-color="light"
                          >
                            Reset password
                          </button>
                          <i className="bx bx-caret-right ml-1" />
                        </a>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>

            {/* </div> */}
          </div>
        </div>
      </section>
    </>
  );
};

export default ForgetPassword;
