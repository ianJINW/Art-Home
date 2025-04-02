import AuthStore from "@/stores/auth.store";
import { Box, Image } from "@chakra-ui/react";
import React from "react";

const Gallery: React.FC = () => {
  const user = AuthStore((state) => state.user);

  return (
    <Box>
      <Box>
        <Image
          src={typeof user?.image === "string" ? user.image : ""}
          alt={user?.username || "User"}
        />
      </Box>
    </Box>
  );
};

export default Gallery;