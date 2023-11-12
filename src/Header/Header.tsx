import logoImgUrl from '../assets/SPHGC.png';
import { STATION } from '../station';

export const Header = () => (
    <header>
        <h1>{STATION.NAME} weather station</h1>
        <a href="https://www.flysydney.com.au/" class="logo">
            <img src={logoImgUrl} alt="SPHGC logo" height="50" width="50" />
        </a>
    </header>
);
