import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4e73df] to-[#224abe] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-[1000px] mx-auto">
        <div className="bg-white rounded-lg shadow-[0_1rem_3rem_rgba(0,0,0,0.175)] overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Left decorative panel */}
            <div 
              className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#4e73df] to-[#224abe] flex-col items-center justify-center p-12 text-white"
            >
              <div className="w-20 h-20 bg-white/15 rounded-full flex items-center justify-center mb-6 border-[3px] border-white/30">
                <i className="fas fa-leaf text-3xl"></i>
              </div>
              <h2 className="font-bold text-2xl mb-2">EPA Punjab</h2>
              <p className="text-white/80 text-sm m-0">Human Resource Personnel Repository</p>
              <hr className="border-white/30 w-full my-6" />
              <p className="text-white/65 text-[0.82rem] leading-relaxed text-center m-0">
                Secure portal for managing employee records,
                office assignments, and personnel data across
                all EPA Punjab districts.
              </p>
            </div>

            {/* Right form panel */}
            <div className="w-full lg:w-1/2 p-8 sm:p-12">
              {/* Mobile brand header (hidden on lg+) */}
              <div className="text-center lg:hidden mb-8">
                <i className="fas fa-leaf text-3xl text-primary"></i>
                <h4 className="font-bold text-[#5a5c69] mt-3">EPA Punjab HR</h4>
              </div>

              <Outlet />
            </div>
          </div>
        </div>

        <p className="text-center text-white/50 text-sm mt-8">
          &copy; {new Date().getFullYear()} Government of Punjab. All rights reserved.
        </p>
      </div>
    </div>
  );
}
