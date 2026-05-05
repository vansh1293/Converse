import RotatingText from '../ui/TextAnimations/RotatingText/RotatingText';
export default function LoginScreen() {
    return (
        <div className="w-full h-full flex items-center justify-center md:text-5xl text-2xl tracking-wide font-bold text-white">
            <h1 className='m-2'>Chatting is</h1>
            <RotatingText
                texts={['Converse','Instant', 'Fun', 'Connecting', 'Expressive']}
                mainClassName="px-2 sm:px-2 md:px-3 bg-cyan-300 text-black overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
                staggerFrom={"last"}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-120%" }}
                staggerDuration={0.025}
                splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                rotationInterval={2000}
            />
        </div>
    )
}
