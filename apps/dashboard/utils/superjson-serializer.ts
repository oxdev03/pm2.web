import SuperJSON from "superjson";
import type { ObjectId } from "bson";

/**
 * Registers a custom serialization for ObjectId without importing addtional dependencies
 */
SuperJSON.registerCustom<ObjectId, string>(
  {
    isApplicable: (v): v is ObjectId => v?._bsontype && v?._bsontype == "ObjectId",
    serialize: (v) => v.toHexString(),
    deserialize: (v) => v as any,
  },
  "ObjectId",
);
