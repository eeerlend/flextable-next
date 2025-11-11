"use client";
import { useEffect, useRef, useState } from "react";
import { useFlexTable } from "../../context/flexTableContext";

export const FlexTableSearch = ({
  fields = [],
  className = "",
  debounceTime = 300,
  ...props
}) => {
  const { variables, setVariables, setCurrentSkip, filterOperators, mode } =
    useFlexTable();

  if (!fields || fields.length === 0) {
    throw new Error("The param 'fields' must be an array of strings");
  }

  const [search, setSearch] = useState("");
  const debounceTimerRef = useRef(null);

  const searchHandler = (e) => {
    const searchString = e.target.value;
    setSearch(searchString);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for debounced filter update
    debounceTimerRef.current = setTimeout(() => {
      let filter;

      fields.forEach((field) => {
        if (searchString !== "") {
          if (!filter) filter = { [filterOperators.OR]: [] };
          filter[filterOperators.OR].push({
            [field]: { contains: searchString, mode: mode },
          });
        }
      });

      const newVariables = { ...variables, filter: filter };
      setVariables(newVariables);
      setCurrentSkip(0);
    }, debounceTime);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <input
      type="text"
      defaultValue={search}
      onChange={searchHandler}
      className={className}
      {...props}
    />
    // <FormInputText
    //   name="search"
    //   placeholder={t("search")}
    //   defaultValue={search}
    //   onChange={searchHandler}
    // />
  );
};
