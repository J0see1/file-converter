/**
 * HomePage.tsx — Landing screen with two conversion option cards.
 */

import wordIcon from '../assets/word.png';
import jpegIcon from '../assets/jpeg.png';

interface HomePageProps {
  onSelectWord: () => void;
  onSelectImage: () => void;
}

export default function HomePage({ onSelectWord, onSelectImage }: HomePageProps) {
  return (
    <>
      <h1 className="home-heading">
        Change file format to your liking.
        <br />
        Choose between these two options
      </h1>

      <div className="home-cards">
        {/* PDF → Word */}
        <button
          id="card-word"
          className="xp-card"
          onClick={onSelectWord}
        >
          <img src={wordIcon} alt="Word" className="xp-card-icon" />
          <span className="xp-card-title">.pdf to .docx</span>
          <span className="xp-card-desc">
            Convert pdf file into editable docs file
          </span>
        </button>

        {/* PDF → Images */}
        <button
          id="card-image"
          className="xp-card"
          onClick={onSelectImage}
        >
          <img src={jpegIcon} alt="Images" className="xp-card-icon" />
          <span className="xp-card-title">.pdf to images</span>
          <span className="xp-card-desc">
            Convert pdf file into various images files
          </span>
        </button>
      </div>
    </>
  );
}
