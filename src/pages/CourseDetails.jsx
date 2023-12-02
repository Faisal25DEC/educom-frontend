import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db, updateDocumentById } from "../firebase/firebase";
import Rating from "react-rating";
import { FaCalendar, FaCircle, FaGlobe, FaStar } from "react-icons/fa";
import { FaCircleCheck } from "react-icons/fa6";
import CourseAccordion from "../components/CourseAccordion";
import { useSelector } from "react-redux";
import { checkReviewed, getReviewForCourse, loadScript } from "../utils/script";
import { toast } from "react-toastify";

const CourseDetails = () => {
  const { currentUser } = useSelector((state) => state.userReducer);
  const { courseId } = useParams();

  const [course, setCourse] = useState({});
  const [razorPay, setRazorPay] = useState(null);

  const isEnrolled =
    currentUser?.courses.findIndex((ele) => ele.id === courseId) !== -1;

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "courses", courseId), (doc) => {
      doc.exists() && setCourse(doc.data());
    });

    return () => {
      unSub();
    };
  }, [courseId]);

  useEffect(() => {
    const handlePayment = async () => {
      const options = {
        key: "rzp_test_XxnjNvE6sXYT54",
        amount: Math.floor(course.price * 100),
        currency: "INR",
        description: "Payment for your service",
        handler: async (response) => {
          const updatedData = {
            ...currentUser,
            courses: [
              ...currentUser.courses,
              { id: courseId, review: 0, progress: 0 },
            ],
          };
          const courseUpdate = {
            ...course,
            students: [
              ...course.students,
              { name: currentUser.displayName, email: currentUser.email },
            ],
          };
          await updateDocumentById("courses", courseId, courseUpdate);
          await updateDocumentById("users", currentUser.id, updatedData);
        },
      };

      const rzp = new window.Razorpay(options);
      setRazorPay(rzp);
    };

    loadScript("https://checkout.razorpay.com/v1/checkout.js", () => {
      // Call handlePayment when the script is loaded and the component mounts
      handlePayment();
    });
  }, [course?.price]);

  useEffect(() => {
    const getCourse = async () => {
      try {
        const courseRef = doc(db, "courses", courseId);
        const courseSnapshot = await getDoc(courseRef);
        if (courseSnapshot.exists()) {
          const courseData = courseSnapshot.data();
          setCourse(courseData);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getCourse();
  }, [courseId]);

  return (
    <div className="w-[100%] ">
      <section
        className={`w-[100%] bg-[#454655] min-h-[40vh] max-h-[70vh] text-white`}
      >
        <div className="w-[80%] m-auto flex justify-between items-end h-[100%] ">
          <div className="flex flex-col gap-[10px] pb-12 w-[70%]">
            <h1 className="text-[48px] font-semibold leading-normal ">
              {course?.name}
            </h1>
            <p className="text-neutral-200 font-light  text-[24px]">
              {course?.description}
            </p>
            <p className="text-neutral-200 font-medium  text-[18px] flex items-center gap-2">
              <FaCalendar /> Duration {course?.duration}
            </p>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-[1px]">
                <Rating
                  initialRating={course?.review}
                  fractions={2}
                  fullSymbol={<FaStar color="gold" />}
                  emptySymbol={<FaStar color="grey" />}
                  readonly={!isEnrolled}
                  onClick={async (value) => {
                    if (!isEnrolled) {
                      toast.error("Please Enroll to review the course");
                      return;
                    }
                    if (
                      isEnrolled &&
                      currentUser?.courses &&
                      checkReviewed(currentUser?.courses, courseId)
                    ) {
                      const userReview =
                        currentUser?.courses &&
                        getReviewForCourse(currentUser?.courses, courseId);
                      const updatedData = {
                        ...course,
                        review:
                          (course.review - userReview + value) /
                          course.reviewCount,
                      };

                      await updateDocumentById(
                        "courses",
                        courseId,
                        updatedData
                      );
                      currentUser?.courses.forEach((ele) => {
                        if (ele.id === courseId) {
                          ele.review = value;
                        }
                      });
                      await updateDocumentById(
                        "users",
                        currentUser?.id,
                        currentUser
                      );
                    } else {
                      const updatedData = {
                        ...course,
                        review:
                          (course.review + value) / (course.reviewCount + 1),
                        reviewCount: course.reviewCount + 1,
                      };

                      await updateDocumentById(
                        "courses",
                        courseId,
                        updatedData
                      );
                      currentUser?.courses.forEach((ele) => {
                        if (ele.id === courseId) {
                          ele.review = value;
                        }
                      });
                      await updateDocumentById(
                        "users",
                        currentUser?.id,
                        currentUser
                      );
                    }
                  }}
                />
                <p className="pb-[4px]">
                  {`(${course?.reviewCount})`}{" "}
                  <span className="text-neutral-200 text-sm">Reviews</span>
                </p>
              </div>
              <div className="">
                <p className="font-bold">{course?.students?.length} Students</p>
              </div>
            </div>
            <div>
              <p>
                Taught By{" "}
                <span className=" font-semibold underline">
                  {course?.instructor}
                </span>
              </p>
            </div>
            <div className=" flex items-center justify-between">
              <p className="flex items-center gap-[4px] pt-2">
                <FaGlobe /> English
              </p>
              {course?.enrollmentStatus === "Open" && (
                <p className="text-[15px] text-neutral-200 flex gap-[4px] items-center px-6">
                  <span className="pr-2">Enrollments</span>
                  <FaCircle color="#54ff54" className="w-2 h-2" /> Open
                </p>
              )}
              {course?.enrollmentStatus === "Closed" && (
                <p className="text-[15px] text-neutral-200 flex gap-[4px] items-center px-6">
                  <span className="pr-2">Enrollments</span>{" "}
                  <FaCircle color="red" className="w-2 h-2" /> Closed
                </p>
              )}
              {course?.enrollmentStatus === "Progress" && (
                <p className="text-[15px] text-neutral-200 flex gap-[4px] items-center px-6">
                  <span className="pr-2">Enrollments</span>
                  <FaCircle color="orange" className="w-2 h-2" /> In Progress
                </p>
              )}
            </div>
          </div>
          <div className=" w-[24rem] h-[30rem] flex justify-start items-end">
            <img
              src={course?.thumbnail}
              alt="course-thumbnail"
              className="object-cover h-[18rem] rounded-t-[1.5rem] "
            />
          </div>
        </div>
      </section>
      <section className="w-[80%] m-auto flex justify-between ">
        <div className="pt-4 w-[70%]">
          <div className="flex flex-col gap-2 py-8">
            <h1 className="text-[28px] text-neutral-800 font-semibold">
              Course Pre-requisites
            </h1>
            <ul className=" list-disc pl-6">
              {course.prerequisites?.map((item) => {
                return <li className="p-2">{item}</li>;
              })}
            </ul>
          </div>

          <h1 className="text-[36px] text-neutral-800 font-semibold">
            Course Content
          </h1>
          {course?.syllabus && (
            <div>
              {course.syllabus.map((content, idx) => {
                return <CourseAccordion content={content} idx={idx} />;
              })}
            </div>
          )}
        </div>
        <div className="w-[24rem] flex flex-col justify-center gap-[12px] p-2 h-[60vh]">
          <h1 className="text-[32px] text-neutral-900 font-medium">
            {course.name}
          </h1>
          <p className="text-[24px] text-neutral-900 font-medium">
            Rs. {course.price}/-
          </p>
          {isEnrolled && (
            <p className="text-center text-[24px] font-bold flex gap-2 items-center justify-center">
              <FaCircleCheck color="green" />
              You Are Already Enrolled
            </p>
          )}
          {!isEnrolled && (
            <button
              onClick={() => {
                razorPay.open();
              }}
              className="mt-2 bg-neutral-800 text-[24px] font-medium rounded-[5rem] text-white border-none p-[10px] hover:bg-opacity-75"
            >
              Enroll Now
            </button>
          )}
          {!isEnrolled && (
            <button className="mt-2 border-[1px] border-neutral-800 text-[24px] font-medium rounded-[5rem] text-neutral-800 p-[10px] hover:bg-neutral-200">
              Add To Cart
            </button>
          )}
          <p className="text-sm text-lightgray text-center">
            30 Days Money Back Guarantee
          </p>
        </div>
      </section>
    </div>
  );
};

export default CourseDetails;
