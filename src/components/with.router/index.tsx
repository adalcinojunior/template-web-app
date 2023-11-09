import React from 'react'
import { NavigateFunction, Location, useNavigate, useLocation } from 'react-router-dom'

export interface IComponentRouter {
    readonly navigate: NavigateFunction
    readonly location: Location
}

export const withRouter = (Component: any) => {
    return (props: any) => {
        const navigate = useNavigate()
        const location = useLocation()
        return (
            <Component navigate={navigate} location={location} {...props}/>
        )
    }
}
