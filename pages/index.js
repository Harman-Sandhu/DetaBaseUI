import Head from "next/head";


const index = () => {
    return (
        <div className="flex bg-[#121212] h-screen text-white justify-center items-center">
            {/* favicon - title*/}
            <Head>
                <title>Harman Sandhu</title>
                <link rel="icon" href="logo.svg" />
            </Head>

            {/* coming soon */}
            <div className="flex flex-col items-center bg-[#222222] p-4 rounded-xl w-2/3 max-w-[650px]">
                <img src="logo.svg" className="w-32 h-32" />
                <h1 className="text-4xl font-bold mt-2">Coming Soon</h1>
                {/* <p className="text-xl">
                    This is a work in progress.
                </p> */}
            </div>
        </div>
    );
}

export default index;