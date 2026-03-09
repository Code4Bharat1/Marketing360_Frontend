import ResetPassword from "@/components/Resetpassword/Resetpassword";
import React, { Suspense } from "react";

const page = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPassword />
      </Suspense>
    </div>
  );
};

export default page;
