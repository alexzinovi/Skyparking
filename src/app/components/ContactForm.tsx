import { useForm } from "react-hook-form";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Mail, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "./LanguageContext";

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export function ContactForm() {
  const { t } = useLanguage();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactFormData>();

  const onSubmit = (data: ContactFormData) => {
    // In a real application, this would send the inquiry to the server
    console.log("Inquiry data:", data);
    toast.success(t("inquirySuccess"));
    reset();
  };

  return (
    <section id="contact" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="mb-4">{t("haveQuestions")}</h2>
            <p className="text-gray-600">
              {t("inquiryDesc")}
            </p>
          </div>

          <Card className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="contact-name">{t("name")}</Label>
                  <Input
                    id="contact-name"
                    {...register("name", { required: t("nameRequired") })}
                    placeholder={t("namePlaceholder")}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-email">{t("email")}</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    {...register("email", { 
                      required: t("emailRequired"),
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: t("emailInvalid")
                      }
                    })}
                    placeholder={t("emailPlaceholder")}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-phone">{t("phoneOptional")}</Label>
                <Input
                  id="contact-phone"
                  type="tel"
                  {...register("phone")}
                  placeholder={t("phonePlaceholder")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">{t("message")}</Label>
                <Textarea
                  id="message"
                  {...register("message", { required: t("messageRequired") })}
                  placeholder={t("messagePlaceholder")}
                  rows={5}
                  className={errors.message ? "border-red-500" : ""}
                />
                {errors.message && (
                  <p className="text-sm text-red-500">{errors.message.message}</p>
                )}
              </div>

              <Button type="submit" size="lg" className="w-full bg-[#ffd700] text-[#1a1a2e] hover:bg-[#ffed4e] font-bold">
                <MessageSquare className="mr-2 h-5 w-5" />
                {t("sendInquiry")}
              </Button>
            </form>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">{t("orContactDirectly")}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a href="tel:+359888123456" className="flex items-center text-blue-600 hover:text-blue-700">
                <Mail className="h-5 w-5 mr-2" />
                +359 888 123 456
              </a>
              <a href="mailto:info@sofiaairportparking.com" className="flex items-center text-blue-600 hover:text-blue-700">
                <Mail className="h-5 w-5 mr-2" />
                info@sofiaairportparking.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}