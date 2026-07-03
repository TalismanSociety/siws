export const MadeByTalisman: React.FC = () => (
  <div className="made-by-talisman text-sm hover:scale-110 transition-all duration-300">
    <a href="https://talisman.xyz" target="_blank" rel="noreferrer">
      {"Made with"}
    </a>
    {/** So the heart emoji doesnt change color on hover */}
    <a href="https://talisman.xyz" target="_blank" rel="noreferrer">
      {" ❤️ "}
    </a>
    <a href="https://talisman.xyz" target="_blank" rel="noreferrer">
      {"by Talisman"}
    </a>
  </div>
)
