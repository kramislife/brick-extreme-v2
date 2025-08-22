import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const instructionApi = createApi({
  reducerPath: "instructionApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/v1",
  }),
  tagTypes: ["Instructions", "Instruction"],
  endpoints: (builder) => ({
    // List (optionally by product)
    getInstructions: builder.query({
      query: (productId) =>
        productId ? `/instructions?product=${productId}` : "/instructions",
      providesTags: (result) =>
        result?.instructions
          ? [
              ...result.instructions.map(({ _id }) => ({
                type: "Instruction",
                id: _id,
              })),
              { type: "Instructions", id: "LIST" },
            ]
          : [{ type: "Instructions", id: "LIST" }],
    }),

    // Create
    createInstruction: builder.mutation({
      query: (data) => ({
        url: "/admin/instructions",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Instructions"],
    }),

    // Update meta
    updateInstruction: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/instructions/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Instruction", id },
        "Instructions",
      ],
    }),

    // Replace file
    replaceInstructionFile: builder.mutation({
      query: ({ id, file }) => ({
        url: `/admin/instructions/${id}/file`,
        method: "PUT",
        body: { file },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Instruction", id },
        "Instructions",
      ],
    }),

    // Delete
    deleteInstruction: builder.mutation({
      query: (id) => ({
        url: `/admin/instructions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Instructions"],
    }),
  }),
});

export const {
  useGetInstructionsQuery,
  useCreateInstructionMutation,
  useUpdateInstructionMutation,
  useReplaceInstructionFileMutation,
  useDeleteInstructionMutation,
} = instructionApi;
