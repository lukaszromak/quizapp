import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Link, useLocation } from 'react-router-dom'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

import { useAppSelector, useAppDispatch } from "../store"
import { logout } from '../features/authSlice'
import { useState, useEffect } from 'react'
import StyledLink from './Misc/StyledLink'

const _navigation = [
  { name: 'Join game', href: '/game/:id', roles: ['ROLE_USER', 'ROLE_MODERATOR', 'ROLE_ADMIN']},
  { name: 'Create quiz', href: '/quiz/createQuiz', roles: ['ROLE_USER', 'ROLE_MODERATOR', 'ROLE_ADMIN']},
  { name: 'Quizzes', href: '/quizList', roles: ['ROLE_USER', 'ROLE_MODERATOR', 'ROLE_ADMIN']},
  { name: 'Create path', href: '/teacher/createPath', roles: ['ROLE_MODERATOR', 'ROLE_ADMIN'] },
  { name: 'Paths', href: '/pathList', roles: ['ROLE_USER', 'ROLE_MODERATOR', 'ROLE_ADMIN']},
  { name: 'Users', href: '/admin/userList', roles: ['ROLE_ADMIN']}
]


function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function Navbar() {
  const location = useLocation()
  const authUser = useAppSelector(state => state.auth.user)
  const [navigation, setNavigation] = useState(_navigation)
  const dispatch = useAppDispatch()

  useEffect(() => {
    const idx = navigation.findIndex(item => item.href == location.pathname);

    if(idx < 0) {
      return
    }

    const tmp: any = [
      ...navigation.slice(0, idx),
      { ...navigation[idx], current: true },
      ...navigation.slice(idx + 1)
    ]

    for(let i = 0; i < tmp.length; i++)
    {
      if(i === idx) {
        tmp[i].current = true;
      } else {
        tmp[i].current = false;
      }
    }

    setNavigation(tmp)

  }, [location])

  const canSeeLink = (rolesUser: string[], rolesLink: string[]) => {
    if(!authUser) return false

    for(let i = 0; i < rolesUser.length; i++) {
      for(let j = 0; j < rolesLink.length; j++) {
        if(rolesUser[i] === rolesLink[j]) {
          return true
        }
      }
    }

    return false
  }

  return (
    <Disclosure as="nav" className="bg-gray-800">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            {/* Mobile menu button*/}
            <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
              <span className="absolute -inset-0.5" />
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="block h-6 w-6 group-data-[open]:hidden" />
              <XMarkIcon aria-hidden="true" className="hidden h-6 w-6 group-data-[open]:block" />
            </DisclosureButton>
          </div>
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <Link className="flex flex-shrink-0 items-center" to={"/"}>
              <img
                alt="Quiz app logo"
                src="/logo512.png"
                className="h-8 w-auto"
              />
              <span className='text-white font-black'>quiziuq</span>
            </Link>
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                {navigation.map((item) => (
                  ((authUser?.roles && canSeeLink(authUser?.roles, item.roles)))  &&
                  <Link
                    key={item.name}
                    to={item.href}
                    aria-current={item.current ? 'page' : undefined}
                    className={classNames(
                      item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                      'rounded-md px-3 py-2 text-sm font-medium',
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            {/* Profile dropdown */}
            {
              authUser ?
              <>
                <span className='text-gray-300 font-medium invisible sm:visible'>Logged in as {authUser.username}</span>
                <button
                  type="button"
                  className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                >
                </button>
                <Menu as="div" className="relative ml-3">
                  <div>
                    <MenuButton className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                      <span className="absolute -inset-1.5" />
                      <span className="sr-only">Open user menu</span>
                      <img
                        alt=""
                        src="/Default_pfp.jpg"
                        className="h-8 w-8 rounded-full"
                      />
                    </MenuButton>
                  </div>
                  <MenuItems
                    transition
                    className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                  >
                    <MenuItem>
                      <Link to="/user" className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100">
                        Your Profile
                      </Link>
                    </MenuItem>
                    <MenuItem>
                      <button onClick={() => dispatch(logout())} className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100">
                        Sign out
                      </button>
                    </MenuItem>
                  </MenuItems>
                </Menu>
              </>
              :
              <StyledLink to='login'>
                <span className='text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium'>Log in</span>
              </StyledLink>
            }
          </div>
        </div>
      </div>

      <DisclosurePanel className="sm:hidden">
        <div className="space-y-1 px-2 pb-3 pt-2">
          {navigation.map((item) => (
            ((authUser?.roles && canSeeLink(authUser?.roles, item.roles)))  &&
            <DisclosureButton
              key={item.name}
              as="a"
              href={item.href}
              aria-current={item.current ? 'page' : undefined}
              className={classNames(
                item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                'block rounded-md px-3 py-2 text-base font-medium',
              )}
            >
              {item.name}
            </DisclosureButton>
          ))}
        </div>
      </DisclosurePanel>
    </Disclosure>
  )
}
