import axios from 'axios';
import { JSDOM } from 'jsdom';
import { LinkedInProfileModel } from './linkedinProfile';
import dotenv from 'dotenv';
dotenv.config();

export async function fetchProfileAndSaveToDatabase(targetProfileUrl: string): Promise<void> {
  try {
    const response = await axios({
      method: 'get',
      url: targetProfileUrl,
      headers: {
        'authority': 'www.linkedin.com',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-GB,en;q=0.9',
        'cache-control': 'max-age=0',
        'cookie': 'bcookie="v=2&e646a51f-1c82-4bec-8872-99a5e4d3e094"; bscookie="v=1&20250313150617b8aa9746-d498-4574-86e0-7734ddc19266AQFGxRyU_GcacYyPnEUpv-m7io3ZhGYe"; AMCVS_14215E3D5995C57C0A495C55%40AdobeOrg=1; li_rm=AQEcSV32m18k_wAAAZWUp9Qb3CkRWjGhbSe7Aq5U8qitUWOiXRkMlRFPknZEZJZb1Pdsn7_ID3pButiPcYml2bHDlwEmPhH9eR7H49C18Kk2RD6qoyHykMMR; liap=true; JSESSIONID="ajax:1768808329034472584"; li_sugr=ad7ed3fd-3946-4482-b768-9e39668dd4fb; _guid=750b86b5-001a-41de-8158-3763f7b78930; dfpfpt=70d69ca94e524045aff8c7fdc34747b8; timezone=Asia/Calcutta; li_theme=dark; li_theme_set=user; s_cc=true; PLAY_LANG=en; PLAY_SESSION=eyJhbGciOiJIUzI1NiJ9.eyJkYXRhIjp7InNlc3Npb25faWQiOiJmNzcyNWI1Yi01MDgzLTQwZjktYmQ0My01MDM5MTRmZTA2NDd8MTc0NDk4ODQ5NyIsImFsbG93bGlzdCI6Int9IiwicmVjZW50bHktc2VhcmNoZWQiOiIiLCJyZWZlcnJhbC11cmwiOiJodHRwczovL3d3dy5saW5rZWRpbi5jb20vaGVscC9saW5rZWRpbi9hbnN3ZXIvYTEzNTkwNjUiLCJyZWNlbnRseS12aWV3ZWQiOiIiLCJDUFQtaWQiOiIne3vCm8KcwpTDoWXCqMKfSMKzLsOnw4g5IiwiZmxvd1RyYWNraW5nSWQiOiJNdnMraXZTNFR5YXVjRzVRYklXczVRPT0iLCJleHBlcmllbmNlIjoiIiwidHJrIjoiIn0sIm5iZiI6MTc0NDk5MDAzOCwiaWF0IjoxNzQ0OTkwMDM4fQ.bsmUNdZax5XLrPL4ts7hQa8MPfsHpcT-DTue9zqAPYY; lang=v=2&lang=en-us; AnalyticsSyncHistory=AQK0cEZIMFDzGQAAAZZojErMD765nzso2rI1PRrIPUm5jezdqJkmbdRUlef3e0e5xomby6cJQ029_lTdatLtOA; lms_ads=AQEINC1NQe3WtAAAAZZojEwiKtwjDjN6ssFSdkr-KlQ6HQH1AtvVPqf8lwMo1NFSoElzdtQKwkcbLHLTwB4xWe2el0C3aOW6; lms_analytics=AQEINC1NQe3WtAAAAZZojEwiKtwjDjN6ssFSdkr-KlQ6HQH1AtvVPqf8lwMo1NFSoElzdtQKwkcbLHLTwB4xWe2el0C3aOW6; fptctx2=taBcrIH61PuCVH7eNCyH0LNKRXFdWqLJ6b8ywJyet7XUnowD3EX3%252bEq7Plf0acjHHO4KIRZp3LrQyMwTwaWWwtCmmQiSwdEe%252f3WJJVkVonZPAMgBVe1t5S3imNhWnzwdvp%252fOSigvbThmdnyE5mi5mYPB%252fHHyYVQmNU3Htd95WcWPBgge%252bbhOIeQDZvuSpldjPSPK9Q61NMokJca4Mw%252fxZTebAzkpYpUGEw8tKeSfyRcHAZO3GjpOvlFklQu2INAiH%252b3xOp3HaM3JTiKAwkyILs8baHdFmdk7YAkeUFkVKkXSmq9dImkRbrxpflVhCU%252fXbN%252bbSU5DpagTR8KJlbSWghsQK7A7utryKqMLfUCM3rQ%253d; sdui_ver=sdui-flagship:0.1.2640; at_check=true; AMCV_14215E3D5995C57C0A495C55%40AdobeOrg=-637568504%7CMCIDTS%7C20203%7CMCMID%7C60873600851499463712819792701109459249%7CMCOPTOUT-1745598085s%7CNONE%7CvVersion%7C5.1.1; _uetsid=6166b9e021e011f0afd7c1a28111a024; _uetvid=6166e6d021e011f083bebfc96ae04090; gpv_pn=developer.linkedin.com%2Fproduct-catalog; s_plt=0.85; s_pltp=developer.linkedin.com%2Fproduct-catalog; s_tp=6969; s_tslv=1745590885696; mbox=session#11c6b37938e5437c944fdce7a7fad93d#1745592746|PC#11c6b37938e5437c944fdce7a7fad93d.41_0#1761142886; s_ips=762.9090908765793; s_ppv=developer.linkedin.com%2Fproduct-catalog%2C23%2C11%2C1588.3636474609375%2C2%2C9; li_at=AQEDAUHGz2QFrDD2AAABlZSn5cMAAAGWkbjUyVYAxeqat-NU8Psx0LfoDPlFdXfy89zR8xoRQy_AtYrDbNeeqQ_fP3qmlW-r8d4yiOD7Hi73z7pxkPdXUuKKUxAz1VaTGr-qPyQKB4pVXNQr2edytfC8; UserMatchHistory=AQL0N2u7JTj0QQAAAZZuBsiWAc3I8RWyWO8qI1Q7xHGQ6jmCq_I_ivzUpA6VpNA7Kp67jpnE0MIkbIzptGXX77bA7O0TV0tH_S1kjekDD23jDt6SQKXd4g-fsZg91Z9A27BX7KxjOztaw_yECw7JEeZA7ed-vr_9vMsOSXrFpCB1g5r-nMOeJkLxeNez8E8oI9a6VHv3OJQC3HylvmhYs--V3hfTO7J8OA-3n5O7xK6uZFpRod6Nvk1NXAPiOWh2dmM9F910igFoVausYu-6TY0ulBXhqpG2Lp9zk4enMEC5Dh0yuYyWOPqk_nNtW0Dw-EXwocrV8i3JJY5PZI1YjlYQdxmw2-an7FzUnNA9Xro0VVTirw; lidc="b=TB60:s=T:r=T:a=T:p=T:g=4112:u=175:x=1:i=1745602661:t=1745604296:v=2:sig=AQFaGdfiJ50Q5cyW5OyoXGmboNv4snGM"; li_theme_set=user; df_ts=1745602669494',
        'sec-ch-ua': '"Brave";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
        'sec-ch-ua-mobile': '?1',
        'sec-ch-ua-platform': '"Android"',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-user': '?1',
        'sec-gpc': '1',
        'upgrade-insecure-requests': '1',
        'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36'
      },
      validateStatus: status => status >= 200 && status < 600,
      responseType: 'text',
      decompress: true
    });

    const html = response.data;
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const details: any = {};

    // Profile Name
    const nameEl = document.querySelector(
      'section.basic-profile-section.bg-color-background-container.pb-2.relative > div.bg-color-background-container.mx-2.mt-2.mb-1 > div.flex.items-center > h1.text-color-text.heading-large'
    );
    details.profileName = nameEl ? nameEl.textContent?.trim() : (document.querySelector('h1')?.textContent?.trim() || null);

    // Profile Picture
    const imgEl = document.querySelector('#profile-picture-container img');
    if (imgEl) {
      const url = imgEl.getAttribute('data-delayed-url') || '';
      details.profilePicture = url.replace(/&;/g, '&');
    } else {
      details.profilePicture = null;
    }

    // Headline
    const headlineEl = document.querySelector(
      'section.basic-profile-section.bg-color-background-container.pb-2.relative > div.bg-color-background-container.mx-2.mt-2.mb-1 > div.body-small.text-color-text > span[dir="ltr"]'
    );
    details.headline = headlineEl ? headlineEl.textContent?.trim() : null;

    // Experience (first)
    const jobEl = document.querySelector(
      'section.bg-color-background-container.experience-container.py-2.pl-2.mt-1.collapsible-list-container > ol > li > div.entity-lockup-border > ul > li > a > div > div.body-medium-bold.list-item-heading > span[dir="ltr"]'
    );
    const compEl = document.querySelector(
      'section.bg-color-background-container.experience-container.py-2.pl-2.mt-1.collapsible-list-container > ol > li > div.entity-lockup-border > ul > li > a > div > div.body-small > span[dir="ltr"]'
    );
    details.experience = (jobEl && compEl)
      ? { title: jobEl.textContent?.trim(), company: compEl.textContent?.trim() }
      : null;

    // About Section
    const aboutEl = document.querySelector(
      'section.relative.about-section.bg-color-background-container.p-2.pr-0.mt-1 > div.summary-container.mr-2 > div.relative.truncated-summary > div.body-small.text-color-text.whitespace-pre-line.description.truncated[dir="ltr"]'
    );
    details.about = aboutEl ? aboutEl.textContent?.trim() : null;

    // Location
    const locEls = document.querySelectorAll(
      'section.basic-profile-section.bg-color-background-container.pb-2.relative > div.bg-color-background-container.mx-2.mt-2.mb-1 > div.body-small.text-color-text-low-emphasis'
    );
    if (locEls.length) {
      const lastLoc = locEls[locEls.length - 1];
      lastLoc.querySelectorAll('span').forEach(el => el.remove());
      // take text till \n only
      const locText = lastLoc.textContent?.trim().split('\n')[0];
      details.location = locText || null;
    } else {
      details.location = null;
    }

    // Save to database
    await LinkedInProfileModel.findOneAndUpdate(
      { profileUrl: targetProfileUrl },
      {
        profileUrl: targetProfileUrl,
        profileName: details.profileName,
        profilePicture: details.profilePicture,
        headline: details.headline,
        experience: details.experience,
        about: details.about,
        location: details.location,
        lastScraped: new Date()
      },
      { upsert: true, new: true }
    );

    console.log(`Successfully scraped and saved profile: ${details.profileName}`);
  } catch (error) {
    console.error('Error fetching or processing profile:', error);
    throw error;
  }
}