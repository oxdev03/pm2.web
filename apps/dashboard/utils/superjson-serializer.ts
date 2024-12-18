/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import type { ObjectId } from "bson";
import SuperJSON from "superjson";

/**
 * Registers a custom serialization for ObjectId without importing addtional dependencies
 */
SuperJSON.registerCustom<ObjectId, string>(
  {
    isApplicable: (v): v is ObjectId => v?._bsontype && v?._bsontype == "ObjectId",
    serialize: (v) => v.toHexString(),
    deserialize: (v) => v as never,
  },
  "ObjectId",
);
