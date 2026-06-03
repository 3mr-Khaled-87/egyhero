import Image from 'next/image';
import Link from 'next/link';
import styles from './special-thanks.module.css';
import { BsArrowRight } from 'react-icons/bs';
import drAhmed from "../../imgs/WhatsApp Image 2026-05-01 at 3.23.14 PM.jpeg";

export default function SpecialThanks() {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Link href="/" className={styles.backBtn}>
                    <BsArrowRight size={20} /> العودة للموقع
                </Link>

            </div>

            <h1 className={styles.title}>شكر وتقدير للاستاذ الدكتور احمد محمود صالح</h1>

            <div className={styles.content}>
                <div className={styles.textContainer}>
                    <p className={styles.intro}>
                        بسم الله، والصلاة والسلام على رسول الله، سيدنا محمد صلى الله عليه وسلم ... وبعد...
                    </p>
                    <p>
                        الرسول صلى الله عليه وسلم قال &quot;من لا يشكر الناس لا يشكر الله&quot;، وحقيقي حابين نشكر دكتور احمد صالح على كل الدعم اللي قدمهولنا خلال مسيرتنا التعليمية وبالاخص مشروع التخرج ورحلة مشروع التخرج، حقيقي كان بيتعامل معانا كأخواته مش بس طلابه ومازال، كل المجهود والشغل والتعب اللي تعبناه على مشروع التخرج كان دكتور احمد سبب رئيسي بعد توفيق ربنا سبحانه وتعالى...
                    </p>
                    <p>
                        ورسالة من فريق عمل EGY hero، احنا بنحب حضرتك جدًا يا دكتور واتعلمنا من حضرتك جدًا دروس في الحياة اكتر من الجانب الاكاديمي، وحقيقي احنا فخورين جدًا ان حضرتك كنت مشرفنا في مشروع التخرج، ولولا توفيق ربنا ووقوف حضرتك معانا مكنش هيكمل بالشكل الرائع ده.
                    </p>
                    <p className={styles.signature}>
                        بكل حب وتقدير، طلابك واخوانك
                        <strong>تيم EGY hero</strong>
                    </p>
                </div>
                <div className={styles.imageContainer}>
                    {/* Placeholder src until user uploads dr-ahmed.jpg */}
                    <Image
                        src={drAhmed.src}
                        alt="Dr. Ahmed Mahmoud Saleh"
                        width={500}
                        height={500}
                        className={styles.image}
                    />
                </div>
            </div>
        </div>
    );
}
