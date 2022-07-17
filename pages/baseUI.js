import Head from 'next/head'
import { Deta } from 'deta'
import React, { useState, useEffect } from 'react'

export default function Home() {
  const [projectKey, setProjectKey] = useState('')
  const [detaBaseName, setDetaBaseName] = useState('')
  const [detaBaseContent, setDetaBaseContent] = useState([])
  const [isShiftKeyDown, setIsShiftKeyDown] = useState(false)
  const [lastSelected, setLastSelected] = useState(null)
  const [Search, setSearch] = useState('')
  const [selectedKeys, setSelectedKeys] = useState([])
  const [isEmpty, setisEmpty] = useState(true)
  const [popupOpened, setPopupOpened] = useState(false)
  const [popupContent, setPopupContent] = useState({})
  const [keys, setKeys] = useState()

  // detect click outside popup
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupOpened && e.target.classList.contains('popup')) {
        setPopupOpened(false)
      }
    }
    if (popupOpened) {
      document.addEventListener('click', handleClickOutside)
    }
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [popupOpened])

  const init = async (e,baseName = detaBaseName) => {
    if (baseName === "" || baseName === undefined || baseName === null) {
      baseName = detaBaseName
    }
    try {
      const deta = Deta(projectKey)
      // console.log('init', projectKey, detaBaseName)
      const db = deta.Base(baseName)
      const all = await db.fetch()
      // get all keys from multiple levels without duplicates and remove "key"
      const keys = all.items.reduce((acc, item) => {
        // no duplicate keys and remove "key"
        return [...acc, ...Object.keys(item).filter(key => key !== 'key')]
      }
        , [])
      // remove duplicate keys and sort alphabetically
      var unique = keys.filter((item, index) => keys.indexOf(item) === index).sort()
      setKeys(unique)
      setDetaBaseContent(all.items)
    } catch (error) {
      alert(error)
    }
    // console.log(all)
  }

  const changeArrayEmpty = () => {
    if (selectedKeys.length > 0) {
      setisEmpty(false)
    }
    else {
      setisEmpty(true)
    }
  }

  const handleSelect = (e, detaRow) => {
    // console.log(e.target.checked, e.target.id, isShiftKeyDown, detaRow, lastSelected)
    if (e.target.checked && lastSelected != null && isShiftKeyDown) {
      for (let i = lastSelected; i != e.target.id; (i <= e.target.id ? i++ : i--)) {
        if (i == lastSelected) continue;
        const el = document.getElementById(i)
        if (el) {
          // console.log(detaBaseContent[i], i)
          selectedKeys.push(detaBaseContent[i].key)
          el.checked = true
          // console.log(i, e.target.id)
        }
      }
      selectedKeys.push(detaBaseContent[e.target.id].key)
    } else if (isShiftKeyDown === false) {
      if (e.target.checked) {
        // console.log(detaBaseContent[e.target.id], e.target.id)
        selectedKeys.push(detaBaseContent[e.target.id].key)
      }
    }
    if (!e.target.checked && isShiftKeyDown) {
      for (let i = lastSelected; i != e.target.id; (i <= e.target.id ? i++ : i--)) {
        if (i == lastSelected) continue;
        const el = document.getElementById(i)
        if (el) {
          var done = selectedKeys.splice(selectedKeys.indexOf(detaBaseContent[i].key), 1)
          // console.log(done, selectedKeys)
          el.checked = false
          // console.log(i, e.target.id)
        }
      }
    }

    if (!e.target.checked) {
      // remove from selectedKeys if it is there
      // console.log(detaBaseContent)
      selectedKeys.splice(selectedKeys.indexOf(detaRow), 1)

    }
    setLastSelected(parseInt(e.target.id))
    changeArrayEmpty()
    // console.log(selectedKeys)
  }

  const deleteItem = async () => {
    if (selectedKeys.length > 0) {
      const deta = Deta(projectKey)
      const db = deta.Base(detaBaseName)
      // delete all selected items

      for (let i = selectedKeys.length - 1; i >= 0; i--) {
        // uncheck the checkbox
        const el = document.getElementById(i)
        if (el) {
          el.checked = false
        }

        const key = selectedKeys[i]
        if (key) {
          await db.delete(key)
        }
        // remove from selectedKeys if it is there
        selectedKeys.splice(selectedKeys.indexOf(selectedKeys[i]), 1)
        // i-=1
      }
      changeArrayEmpty()
      // console.log('deleted')
      init()
    }
  }

  const addItem = async () => {
    const deta = Deta(projectKey)
    const db = deta.Base(detaBaseName)
    await db.insert({})
    init()
  }

  const updateItem = async () => {
    const deta = Deta(projectKey)
    const db = deta.Base(detaBaseName)
    // const res = await db.update(popupContent.item.key, { [popupContent.key]: popupContent.value })
    await db.update({ [popupContent.key]: (popupContent.value[0] === "{" ? (popupContent.value.length > 1 ? JSON.parse(popupContent.value) : JSON.parse(popupContent.value)) : popupContent.value[0] === "[" ? (popupContent.value.length > 1 ? JSON.parse(popupContent.value) : null) : popupContent.value) }, popupContent.item.key)
    // console.log(popupContent)
    setPopupOpened(false)

    init()
  }

  return (
    <div className="container px-4 md:mx-auto md:px-4 lg:px-0 max-w-5xl overflow-x-none">
      <Head>
        <title>{`DETA Base UI ` + (detaBaseName && "- " + detaBaseName)}</title>
        <link rel="icon" href="/favicon.svg" />

        {/* meta tags */}
        <meta name="title" content="DETA Base UI" />
        <meta
          name="description"
          content="A place with more functionality for managing your Deta Base(s)."
        />
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://harmansandhu.tech/baseui" />
        <meta property="og:title" content="DETA Base UI" />
        <meta
          property="og:description"
          content="A place with more functionality for managing your Deta Base(s)."
        />
        <meta property="og:image" content="https://harmansandhu.tech/BaseUI.jpg" />
        {/* Twitter */}
        <meta property="twitter:card" content="https://harmansandhu.tech/BaseUI.jpg" />
        <meta property="twitter:url" content="https://harmansandhu.tech/baseui" />
        <meta property="twitter:title" content="DETA Base UI" />
        <meta
          property="twitter:description"
          content="A place with more functionality for managing your Deta Base(s)."
        />
        <meta property="twitter:image" content="https://harmansandhu.tech/BaseUI.jpg" />

      </Head>
      <div className={"py-5 " + (popupOpened ? " blur-[2px] py-8 animate-pulse" : "")}>
        <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row mb-1 sm:mb-0 justify-between w-full">
          <div className="flex  md:justify-center my-auto items-center max-h-6">
            {/* <img src="https://docs.deta.sh/img/logo.svg" alt="DETA" className="h-10 w-10" /> */}
            <div className="text-2xl leading-tight" >
              Deta Base
              <span>
                {detaBaseName && <>
                  <span> - </span>
                  <span title="Change Base" onClick={async () => {
                    if (detaBaseContent.length > 0) {
                      var newBase = prompt("Enter Base name:", detaBaseName && detaBaseName)
                      if (newBase) {
                        setDetaBaseName(newBase)
                        await init(newBase)
                      }
                    }
                    else { alert("Please enter Project Key first") }
                  }
                  } className="px-2 py-1 text-base rounded-md hover:cursor-pointer hover:border-pink-400 hover:text-pink-400 border border-slate-400 text-slate-400">{detaBaseName}</span>
                </>
                }
              </span>
            </div>
            {/* total rows */}
            <div className="text-sm self-end text-gray-600">
              {detaBaseContent.length > 0 &&
                <>
                  &nbsp;({detaBaseContent.length} rows)
                </>
              }
            </div>
          </div>
          {detaBaseContent.length > 0 &&
            <div className="flex flex-row justify-end w-full md:w-auto space-x-1 justify-items-end content-end md:items-center">
              {/* add button */}
              <button
                className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-3 rounded"
                onClick={addItem}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>

              {/* delete button */}
              {!isEmpty && (
                <button
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  onClick={() => {
                    deleteItem()
                  }
                  }>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
              <form className="flex flex-col md:flex-row w-full md:w-full max-w-sm md:space-x-3 space-y-3 md:space-y-0 justify-center">
                <div className=" relative ">
                  <input autoCapitalize='off' onChange={(e) => { setSearch(e.target.value) }} type="text" id="&quot;form-subscribe-Filter" className=" rounded-lg border-transparent flex-1 appearance-none border border-gray-300 w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-pink-600 focus:border-transparent" placeholder="Search" />
                </div>
              </form>

              {/* refresh button - bold svg*/}
              <button
                className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-3 rounded"
                onClick={init} title="Fetch">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              </button>

            </div>
          }
        </div>
        <div className={`xl:px-0 ${detaBaseContent.length > 0 && "py-4 "}`}>
          <div className="text-sm block shadow rounded-lg overflow-x-auto h-full max-h-[85vh]">
            {detaBaseContent.length > 0 &&
              <table className="min-w-full leading-normal">
                <thead className="z-50 sticky top-0">
                  <tr>
                    {/* empty heading for select button */}
                    <th className="px-4 py-2 bg-gray-100 text-center text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                      {/* <label title='Select' className="flex items-center justify-center space-x-3">
                        <input type="checkbox" className="form-tick hover:cursor-pointer appearance-none bg-white bg-check h-6 w-6 border border-gray-300 rounded-md checked:bg-pink-500 checked:border-transparent focus:outline-none" />
                      </label> */}
                      ⠀
                    </th>
                    {/* get all these: key, image, name, price, prodId, user from detaBaseContent*/}
                    <th className="px-4 py-2 bg-gray-100 text-xs text-center leading-4 font-medium text-gray-500 uppercase tracking-wider">
                      key
                    </th>
                    {
                      // get all from "keys" variable and null if is "key"
                      keys.map((key, index) => {
                        if (key !== "key") {
                          return (
                            <th className="px-4 py-2 bg-gray-100 text-xs text-left leading-4 font-medium text-gray-500 uppercase tracking-wider" key={index}>
                              {key}
                            </th>
                          )
                        }
                      })
                    }
                  </tr>
                </thead>
                <tbody>
                  {detaBaseContent.map((item, index) => {
                    {/* select button for each row in detaBaseContent*/ }
                    return <React.Fragment key={index}>
                      {item.key.includes(Search) &&
                        <tr key={index + "key"}>
                          <td className="md:min-w-[72px] w-[72px] md:max-w-[72px] py-2 bg-gray-100">
                            <label className="flex items-center  justify-center flex-col relative ">
                              <input onKeyUp={(e) => { setIsShiftKeyDown(e.shiftKey) }} onChange={(e) => { handleSelect(e, item.key) }} onKeyDown={(e) => { setIsShiftKeyDown(e.shiftKey) }} id={index} type="checkbox" className="relative hover:cursor-pointer text-pink-500 bg-white h-6 w-6 border border-gray-300 rounded-md focus:ring-pink-500 focus:outline-none" />
                              {/* <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 stroke-white absolute " fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg> */}
                            </label>
                          </td>
                          <td className="md:px-5 py-5 border-t border-r border-gray-200 bg-white px-2 ">
                            <div className="flex items-center justify-start md:max-w-[]">
                              <div className="mx-auto">
                                <p className="text-gray-900 whitespace-no-wrap truncate">
                                  {item.key}
                                </p>
                              </div>
                            </div>
                          </td>
                          {/* put the item in the correct slot and null if its key */}
                          {keys.map((key, index) => {
                            if (key !== "key") {
                              return (
                                <td key={"key_" + key} className="px-5 py-5 border-t border-r border-gray-200 bg-white">
                                  <div className={`flex items-center ${Array.isArray(item[key]) && "justify-center"} ${typeof item[key] === "object" && 'justify-center'} ${typeof item[key] === "boolean" && "justify-center"}`}>
                                    {
                                      typeof item[key] === 'boolean' ?
                                        <>
                                          <input onClick={() => {
                                            setPopupContent({ item: item, key: key, value: item[key] })
                                            setPopupOpened(true)
                                          }}
                                            readOnly={true} checked={item[key]} type="checkbox" className="hover:cursor-pointer relative appearance-none h-6 w-6 border border-gray-300 rounded-md checked:bg-pink-500 checked:border-transparent active:bg-pink-500 focus:outline-none" />
                                          <svg onClick={() => {
                                            setPopupContent({ item: item, key: key, value: item[key] })
                                            setPopupOpened(true)
                                          }} xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 stroke-white absolute" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                          </svg>
                                        </>

                                        :
                                        <p onClick={() => {
                                          setPopupContent({ item: item, key: key, value: item[key] })
                                          setPopupOpened(true)
                                        }} title={(Array.isArray(item[key]) ? "array" : (typeof item[key] === 'object') ? 'object' : item[key])} className={`text-gray-900 truncate max-w-[5rem] min-w-full ${(Array.isArray(item[key]) || (typeof item[key] === 'object')) && "px-2 min-w-min rounded-md hover:cursor-pointer hover:border-pink-400 hover:text-pink-400 py-1 border border-slate-400 text-slate-400"}`}>
                                          {Array.isArray(item[key]) ? "array" : (typeof item[key] === 'object') ? 'object' : (item[key] ? item[key] : "⠀")}
                                        </p>
                                    }
                                  </div>
                                </td>
                              )
                            }
                          })}
                        </tr>
                      }
                    </React.Fragment>
                  }
                  )}
                </tbody>
              </table>
            }
          </div>
        </div>
      </div>
      <div className="space-y-2 mb-4">
        {!detaBaseContent.length > 0 &&
          <>
            <div className=" relative ">
              <input autoCapitalize='off' type="text" onChange={
                (e) => {
                  setProjectKey(e.target.value)
                }
              } className=" rounded-lg border-transparent flex-1 appearance-none border border-gray-300 w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-pink-600 focus:border-transparent" placeholder="Your project key" />
            </div>

            <div className=" relative ">
              <input autoCapitalize='off' type="text" onChange={
                (e) => {
                  setDetaBaseName(e.target.value)
                }
              } className=" rounded-lg border-transparent flex-1 appearance-none border border-gray-300 w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-pink-600 focus:border-transparent" placeholder="Your deta base" />
            </div>

            <button onClick={(e) => { init() }} type="button" className="py-2 px-3 bg-pink-600 hover:bg-pink-700 focus:ring-pink-500 focus:ring-offset-pink-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2">
              Fetch
            </button>
          </>
        }
      </div>
      {/* small editable popup on center of the page with save and close button */}
      {popupOpened &&
        <div className="fixed inset-0 z-50 overflow-auto">
          <div className="flex items-center justify-center min-h-screen popup">
            <div className="max-w-lg w-full bg-white rounded-3xl shadow-lg overflow-y-auto">
              <div className="relative z-10 px-4 py-5 sm:p-6">
                {/* <div className="flex justify-end">
                  <button onClick={() => { setPopupOpened(false) }} className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-300 focus:shadow-outline-gray transition ease-in duration-150">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div> */}
                <div className={`relative flex flex-col ` + ((typeof popupContent.value === "boolean") ? "min-h-[15vh]" : "min-h-[35vh]")} >
                  {typeof popupContent.value == "boolean" ?
                    <>
                      <div className='w-full max-h-32 h-full flex-grow min-h-16 bg-slate-100 focus:border-pink-500 focus:ring-pink-500 border-2 border-gray-300 rounded-lg shadow-sm p-4 text-gray-700 resize-none'>

                        <div className="flex my-1 space-x-2">

                          <span>Value: </span>
                          <span className="text-gray-900 truncate max-w-[5rem] ">{popupContent.value === true ? "True" : "False"}</span>
                          <input type="checkbox" defaultChecked={popupContent.value} onChange={(e) => {
                            setPopupContent({ ...popupContent, value: e.target.checked })
                          }
                          } className="relative appearance-none h-6 w-6 border border-gray-300 rounded-md checked:bg-pink-500 checked:border-transparent focus:outline-none" />

                        </div>

                      </div>
                      <button onClick={() => { updateItem() }}
                        className="rounded-md py-1 mt-2 bg-pink-600 hover:bg-pink-700 focus:ring-pink-500 focus:ring-offset-pink-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2">
                        Save
                      </button>
                    </>
                    : <>
                      <textarea spellCheck={false} onChange={(e) => {
                        setPopupContent({ ...popupContent, value: e.target.value })
                      }} readOnly={false} defaultValue={Array.isArray(popupContent.value) ? (
                        JSON.stringify(popupContent.value, null, 2)
                      ) : typeof popupContent.value === 'object' ? JSON.stringify(popupContent.value, null, 2) : popupContent.value} className="w-full max-h-56 flex-grow min-h-16 bg-slate-100 focus:border-pink-500 focus:ring-pink-500 border-2 border-gray-300 rounded-lg shadow-sm p-4 text-gray-700 resize-none" placeholder="Enter your content here" />
                      {/* {console.log(typeof popupContent.value)} */}
                      <button onClick={() => { updateItem() }}
                        className="rounded-md py-1 mt-2 bg-pink-600 hover:bg-pink-700 focus:ring-pink-500 focus:ring-offset-pink-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2">
                        Save
                      </button>
                    </>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  )
}
