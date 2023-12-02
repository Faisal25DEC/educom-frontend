import React from "react";
import { FaCircle, FaStar } from "react-icons/fa";
import Rating from "react-rating";
import { Link } from "react-router-dom";

const CourseCard = ({ course }) => {
  return (
    <Link to={`/courses/${course.id}`}>
      <div className="flex flex-col gap-2 min-h-[17rem]">
        <div>
          <img
            src={course.thumbnail}
            alt="course-thumbnail"
            className="w-[100%] object-cover h-[12rem]"
          />
        </div>
        <div className="flex flex-col gap-[0.75rem]">
          <h3 className="text-[20px] font-bold ">{course.name}</h3>
          <div className="flex justify-between items-center">
            <p className="text-neutral-500 font-medium">{course.instructor}</p>
            {course.enrollmentStatus === "Open" && (
              <p className="text-[15px] text-neutral-500 flex gap-[4px] items-center px-6">
                <FaCircle color="#54ff54" className="w-2 h-2" /> Open
              </p>
            )}
            {course.enrollmentStatus === "Closed" && (
              <p className="text-[15px] text-neutral-500 flex gap-[4px] items-center px-6">
                <FaCircle color="red" className="w-2 h-2" /> Closed
              </p>
            )}
            {course.enrollmentStatus === "Progress" && (
              <p className="text-[15px] text-neutral-500 flex gap-[4px] items-center px-6">
                <FaCircle color="orange" className="w-2 h-2" /> In Progress
              </p>
            )}
          </div>

          <div className="flex items-center gap-[1px]">
            <Rating
              initialRating={course.review}
              fractions={2}
              fullSymbol={<FaStar color="gold" />}
              emptySymbol={<FaStar color="grey" />}
              readonly
            />
            <p className="pb-[4px]">{`(${course.reviewCount})`}</p>
          </div>
          <p className="font-semibold">Rs. {course.price}</p>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;