import { useEffect, useState } from "react";
import { Link } from "react-router-dom"
// import Selects from "../Selects";
import SidebarForUsers from "../../Components/SidebarForUsers";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../reduxToolkit/Store";
import { getAllUsers } from "../../reduxToolkit/Reducers/Auth.tsx/UsersSlice";
import RightSideMessage from "../../Components/RightSideMessage";
import { ToastContainer } from "react-toastify";

// type Props = {};

const Dashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [user, setUser] = useState([])
  const result = useSelector((state: any) => state.usersReducers)
  // console.log(result, 'result')
  const userDetails: any = localStorage.getItem('user');
  // console.log(userDetails, 'userDetails')
  const userName = JSON.parse(userDetails)?.userName
  const avatarImage = JSON.parse(userDetails)?.avatarImage
  console.log(userName,'userDetailsuserDetails')

  useEffect(() => {
    dispatch(getAllUsers())
  }, [])

  const handleClickOnUser = (data: any) => {
    setUser(data)
  }


  return (
    <>
      <ToastContainer />
      <div className="">
        <div className="min-w-full  rounded grid grid-cols-5  ">
          <div className="border-r border-gray-300 col-span-1 ">
            <div className="pt-3 px-3 border-b w-100 grid grid-cols-6">

              <div className="relative pb-3   flex items-center  border-gray-300">
                <Link to="/profile">
                  <img
                    className="object-cover w-14 h-14 rounded-full border1 cursor-pointer"
                    src={avatarImage ? avatarImage : "https://cdn.pixabay.com/photo/2018/09/12/12/14/man-3672010__340.jpg"}
                    alt="username"
                  />
                </Link>
                <span className=" w-3 h-3 bg-green-600 rounded-full absolute left-[40px] top-1"></span>

              </div>
              <div className="col-span-4  w-100">
                <span className="block ml-2 mt-4 font-bold text-gray-600">{userName}</span>
              </div>

            </div>
            <SidebarForUsers data={result && result.result} handleClickOnUser={handleClickOnUser} />
          </div>
          <RightSideMessage user={user} />

        </div>
      </div>
    </>
  );
};

export default Dashboard;
