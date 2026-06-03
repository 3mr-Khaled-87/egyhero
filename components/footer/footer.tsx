'use client'
import { FaEnvelope  } from "react-icons/fa"
import { FaPhone   } from "react-icons/fa"
import Image from 'next/image';
import logo from "@/imgs/logo.png";
import Hlogo from "@/imgs/Hlogo.png";
import Link from 'next/link';
import './footer.css'

export default function Footer(){
    return(
        <>
            <div className="footer">
                
                <div className="container">
                    <div className="row">
                        <div className="col-lg-3 col-md-6 col-sm-12 mt-5">
                            <div className="def">
                                <h3>Egy Hero</h3>
                                <p>منصة Egy Hero : منصة رقمية داعمة لمبادرات مؤسسة حياة كريمة , تهدف الي تحفيز طلاب الجامعات علي العمل التطوعي , وتحويل مجهوداتهم الي نقاط وإنجازات</p>
                            </div>
                        </div>

                        <div className="col-lg-3 col-md-6 col-sm-12 mt-5">
                            <div className="fastLinks">
                                <h3>لينكات سريعة</h3>
                                <Link href="/" className='link'>الرئيسية</Link>
                                <Link href="/leaderBoard" className='link'>لوحة المتصدرين</Link>
                                <Link href="/uploadWorks" className='link'>توثيق الأعمال</Link>
                            </div>
                        </div>

                        <div className="col-lg-3 col-md-6 col-sm-12 mt-5">
                            <div className="contactInfo">
                                <h3>تواصل معنا</h3>
                                <div className="emailInfo">
                                    <div className="emailSec">
                                        <FaEnvelope className='emailsIcon'/>
                                        <div className="emails">
                                            <a href="">aaa@gmail.com</a>
                                            <a href="">aaa@gmail.com</a>
                                            <a href="">aaa@gmail.com</a>
                                        </div>
                                    </div>
                                </div>

                                <div className="phoneInfo">
                                    <FaPhone className='phoneicon'/>
                                    <span>010********</span>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-3 col-md-6 col-sm-12 mt-5">
                            <div className="FooterLogos">
                                <Image src={logo} alt="Egy Hero logo" className='Elogo'/>
                                <Image src={Hlogo} alt="Hayah Karema logo" className='Elogo'/>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="secure">
                    <p>جميع حقوق النشر محفوظة©2026</p>
                </div>
            </div>
        </>
    )
}