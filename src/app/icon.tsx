import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
    width: 32,
    height: 32,
}
export const contentType = 'image/png'

export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: 'white',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <svg
                    width="28"
                    height="28"
                    viewBox="0 0 32 32"
                    fill="none"
                >
                    <path
                        d="M4 26 L12 12"
                        stroke="#0a66c2"
                        strokeWidth="4"
                        strokeLinecap="round"
                    />
                    <path
                        d="M13 26 L24 6"
                        stroke="#0a66c2"
                        strokeWidth="4"
                        strokeLinecap="round"
                    />
                </svg>
            </div>
        ),
        {
            ...size,
        }
    )
}
