"use client";
import { useState } from "react";
import { useFlexTable } from "../context/flexTableContext";

export const useFormSubmission = ({
  mutationFn,
  deleteFn,
  onSuccess,
  onOptimisticSuccess,
  onError,
  optimisticUpdate = true,
}) => {
  const { rows, onAddRow, onEditRow, onDeleteRow } = useFlexTable();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData, options = {}) => {
    if (!mutationFn) {
      throw new Error("mutationFn is required for running handleSubmit");
    }
    const { action = "add", rowId = null } = options;
    setIsSubmitting(true);

    try {
      let optimisticRow = null;
      let tempId = null;
      if (optimisticUpdate) {
        tempId = rowId || `temp-${Date.now()}`;
        optimisticRow = {
          ...formData,
          id: rowId || `temp-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        if (action === "add") {
          onAddRow(optimisticRow);
          onOptimisticSuccess?.(optimisticRow);
        } else if (action === "edit") {
          onEditRow(optimisticRow);
          onOptimisticSuccess?.(optimisticRow);
        }
      }

      // Actual mutation
      const response = await mutationFn(formData);

      if (response.success) {
        // Replace optimistic update with real data
        if (optimisticUpdate) {
          if (action === "add") {
            onDeleteRow(tempId);
            onAddRow(response.data);
          } else if (action === "edit") {
            onEditRow(response.data);
          }
        } else {
          // Non-optimistic: just update
          if (action === "add") {
            onAddRow(response.data);
          } else if (action === "edit") {
            onEditRow(response.data);
          }
        }
        onSuccess?.(response);
        return response;
      } else {
        // Rollback optimistic update
        if (optimisticUpdate && action === "add") {
          onDeleteRow(optimisticRow.id);
        } else if (optimisticUpdate && action === "edit") {
          // Re-fetch or restore previous state
          // You might want to trigger a refetch here
        }
        throw new Error(response.message);
      }
    } catch (error) {
      onError?.(error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (rowId) => {
    if (!deleteFn) {
      throw new Error("deleteFn is required for handleDelete");
    }
    setIsSubmitting(true);
    try {
      // Optimistic delete
      const deletedRow = rows.find((r) => r.id === rowId);
      if (optimisticUpdate) {
        onDeleteRow(rowId);
      }

      const response = await deleteFn(rowId);
      if (response.success) {
        onSuccess?.(response); // Add this for consistency
        return response; // Add this for consistency
      } else {
        // Rollback
        if (optimisticUpdate) {
          onAddRow(deletedRow);
        }
        throw new Error(response.message); // Add this for consistency
      }
    } catch (error) {
      onError?.(response);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmit,
    handleDelete,
    isSubmitting,
  };
};
