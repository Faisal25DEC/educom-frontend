import Hero from "../components/Hero";
import Banner from "../components/Banner";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { getAllCourses } from "../store/courses/courses.actions";
import CourseCard from "../components/CourseCard";

const Home = () => {
  const dispatch = useDispatch();
  const { allCourses } = useSelector((state) => state.coursesReducer);

  useEffect(() => {
    dispatch(getAllCourses());
  }, [dispatch]);

  return (
    <>
      <Hero />
      <Banner />
      <div className="w-[80%] m-auto py-12 flex flex-col gap-12">
        <h1 className="text-center text-neutral-900 font-semibold text-[48px]">
          Top Courses
        </h1>
        <div className="grid grid-cols-4 gap-4 w-[100%] gap-y-12">
          {allCourses?.map((course, index) => {
            if (index < 4) {
              return <CourseCard course={course} />;
            }
          })}
        </div>
      </div>
    </>
  );
};

export default Home;